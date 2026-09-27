import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { signOut } from 'firebase/auth';

import { auth } from '../config/firebase';
import { normalizarEmailCadastro as normalizarEmail } from './salvarUsuario';

/*
 * Acesso rápido por biometria: uma trava LOCAL sobre a sessão do
 * Firebase Authentication (que continua sendo a autenticação).
 *
 * Fluxo: login → e-mail igual ao da sessão guardada neste aparelho
 * → biometria automática → entra. Sem sessão (ex.: depois de "Sair")
 * não há o que destravar e o login é pela senha.
 *
 * No aparelho ficam só a preferência e o contador de falhas
 * (SecureStore). Senha e dados biométricos nunca são guardados:
 * quem confere a biometria é o sistema operacional e quem confere
 * a senha é o Firebase.
 */

export const MAXIMO_FALHAS = 3;

export const PREFERENCIA = {
  ATIVADA: 'ativada',
  RECUSADA: 'recusada',
};

// Chaves do SecureStore aceitam apenas letras, números, ".", "-" e "_".
const chavePreferencia = (uid) => `conecta.biometria.${uid}`;
const chaveFalhas = (uid) => `conecta.biometria.falhas.${uid}`;

// Tem sensor e há biometria cadastrada no sistema?
export async function biometriaDisponivel() {
  try {
    const [temSensor, cadastrada] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    return temSensor && cadastrada;
  } catch (erro) {
    console.log('Não foi possível verificar a biometria:', erro);
    return false;
  }
}

export async function lerPreferencia(uid) {
  const valor = await SecureStore.getItemAsync(chavePreferencia(uid));

  return Object.values(PREFERENCIA).includes(valor) ? valor : null;
}

export async function salvarPreferencia(uid, preferencia) {
  if (!Object.values(PREFERENCIA).includes(preferencia)) {
    throw new Error('PREFERENCIA_INVALIDA');
  }

  await SecureStore.setItemAsync(chavePreferencia(uid), preferencia);

  if (preferencia === PREFERENCIA.RECUSADA) {
    await zerarFalhas(uid);
  }
}

// Oferece só uma vez: quando há biometria e ainda não houve escolha.
export async function deveOferecerBiometria(uid) {
  return (await lerPreferencia(uid)) === null && (await biometriaDisponivel());
}

export async function lerFalhas(uid) {
  const valor = Number.parseInt(await SecureStore.getItemAsync(chaveFalhas(uid)), 10);

  return Number.isInteger(valor) && valor > 0 ? valor : 0;
}

// O contador fica no aparelho: fechar e abrir o app não o zera.
export async function registrarFalha(uid) {
  const total = (await lerFalhas(uid)) + 1;

  await SecureStore.setItemAsync(chaveFalhas(uid), String(total));

  return total;
}

export async function zerarFalhas(uid) {
  await SecureStore.deleteItemAsync(chaveFalhas(uid));
}

/*
 * Resultado de authenticateAsync →
 *   sucesso | falha | cancelado | usar_senha | bloqueado | indisponivel
 *   | nao_configurado
 */
export function classificarResultado(resultado) {
  if (resultado?.success) return 'sucesso';

  switch (resultado?.error) {
    case 'user_cancel':
    case 'system_cancel':
    case 'app_cancel':
      return 'cancelado';
    case 'user_fallback':
      return 'usar_senha';
    case 'lockout':
      return 'bloqueado';
    case 'not_enrolled':
    case 'not_available':
    case 'passcode_not_set':
      return 'indisponivel';
    case 'missing_usage_description':
      // iPhone com Face ID sem a permissão NSFaceIDUsageDescription no app
      // (é o caso do Expo Go): o sistema nem abre o Face ID. Não é falha.
      return 'nao_configurado';
    default:
      // authentication_failed e erros inesperados contam como falha,
      // para o fluxo sempre terminar na senha.
      return 'falha';
  }
}

/*
 * Decide o próximo passo da tela de desbloqueio.
 * falhas: total já registrado ANTES desta tentativa.
 */
export function proximoPasso(classificacao, falhas) {
  switch (classificacao) {
    case 'sucesso':
      return { acao: 'entrar', falhas: 0 };
    case 'falha': {
      const total = falhas + 1;

      if (total >= MAXIMO_FALHAS) {
        return {
          acao: 'senha',
          falhas: total,
          mensagem: 'Não foi possível autenticar pela biometria. Digite sua senha para continuar.',
        };
      }

      return {
        acao: 'biometria',
        falhas: total,
        mensagem: `Biometria não reconhecida (tentativa ${total} de ${MAXIMO_FALHAS}).`,
      };
    }
    case 'cancelado':
      return {
        acao: 'biometria',
        falhas,
        mensagem: 'Biometria cancelada. Tente novamente ou use sua senha.',
      };
    case 'usar_senha':
      return { acao: 'senha', falhas, mensagem: 'Digite sua senha para continuar.' };
    case 'nao_configurado':
      return {
        acao: 'senha',
        falhas,
        mensagem: 'O Face ID não pode ser usado nesta versão de teste do app (Expo Go). Digite sua senha para continuar.',
      };
    case 'bloqueado':
      return {
        acao: 'senha',
        falhas,
        mensagem: 'A biometria foi bloqueada pelo sistema. Digite sua senha para continuar.',
      };
    default:
      return {
        acao: 'senha',
        falhas,
        mensagem: 'A biometria não está disponível neste aparelho. Digite sua senha para continuar.',
      };
  }
}

export async function autenticarComBiometria() {
  try {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Entrar no Conecta',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar senha',
      // A alternativa é a senha do Conecta, não o PIN do aparelho.
      disableDeviceFallback: true,
    });

    return classificarResultado(resultado);
  } catch (erro) {
    console.log('Biometria indisponível:', erro);
    return 'indisponivel';
  }
}

/*
 * Abertura do app com sessão restaurada pelo Firebase:
 *   'desbloquear' → biometria ativada: a sessão fica travada e a tela
 *                   de login pode destravá-la pela biometria;
 *   'login'       → sem sessão, ou biometria não ativada (a sessão
 *                   restaurada é encerrada e o login pede a senha).
 */
export async function decidirAcessoRestaurado(usuarioFirebase) {
  if (!usuarioFirebase) {
    return 'login';
  }

  if ((await lerPreferencia(usuarioFirebase.uid)) === PREFERENCIA.ATIVADA) {
    return 'desbloquear';
  }

  await signOut(auth);

  return 'login';
}

// O e-mail digitado é o da sessão guardada neste aparelho?
export function emailCorrespondeSessao(emailDigitado, sessao) {
  return Boolean(sessao?.email) && normalizarEmail(emailDigitado) === normalizarEmail(sessao.email);
}

/*
 * Decide, na tela de login, se a biometria deve abrir sozinha.
 *   iniciar           → abrir a biometria agora
 *   nao_se_aplica     → login normal por senha (sem sessão, outro e-mail
 *                       ou biometria não ativada)
 *   senha_por_falhas  → já houve 3 falhas: só pela senha
 *   indisponivel      → ativada, mas o aparelho não tem biometria
 */
export function decidirInicioBiometria({ emailDigitado, sessao, preferencia, disponivel, falhas }) {
  if (!emailCorrespondeSessao(emailDigitado, sessao) || preferencia !== PREFERENCIA.ATIVADA) {
    return 'nao_se_aplica';
  }

  if (falhas >= MAXIMO_FALHAS) {
    return 'senha_por_falhas';
  }

  return disponivel ? 'iniciar' : 'indisponivel';
}
