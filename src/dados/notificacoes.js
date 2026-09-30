import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { descreverCasa } from './presencaFamiliar';

/*
 * Notificações LOCAIS: o próprio aparelho observa o banco (SOS,
 * convites, membros e localizações) e mostra o aviso. Não há servidor de push:
 * com o banco local, os eventos de outra conta aparecem quando ela
 * entra no app neste celular; com o Firestore, chegam enquanto o app
 * estiver aberto ou em segundo plano.
 *
 * As chaves são as mesmas salvas antes em Configurações.
 */
export const TIPOS_NOTIFICACAO = [
  {
    chave: 'sos',
    titulo: 'Alertas de SOS',
    descricao: 'Avisar quando um familiar acionar o SOS.',
    icone: 'alert-triangle',
  },
  {
    chave: 'solicitacoes',
    titulo: 'Convites recebidos',
    descricao: 'Avisar quando alguém convidar você para uma família.',
    icone: 'user-plus',
  },
  {
    chave: 'aprovacoes',
    titulo: 'Convites aceitos',
    descricao: 'Avisar quando alguém aceitar um convite que você enviou.',
    icone: 'check-circle',
  },
  {
    chave: 'recusas',
    titulo: 'Convites recusados',
    descricao: 'Avisar quando alguém recusar um convite que você enviou.',
    icone: 'x-circle',
  },
  {
    chave: 'novosMembros',
    titulo: 'Novos membros',
    descricao: 'Avisar quando um novo membro entrar na sua família.',
    icone: 'users',
  },
  {
    chave: 'localizacaoAtualizada',
    titulo: 'Atualizações de localização',
    descricao:
      'Avisar quando a localização de um familiar for atualizada (no máximo um aviso a cada 30 min por familiar).',
    icone: 'map-pin',
  },
];

export const PREFERENCIAS_PADRAO = Object.fromEntries(
  TIPOS_NOTIFICACAO.map(({ chave }) => [chave, true])
);

// Um aviso de localização por familiar a cada 30 min, no máximo.
export const INTERVALO_AVISO_LOCALIZACAO = 30 * 60 * 1000;

// Canais do Android: SOS com prioridade máxima e vibração própria.
const CANAL_FAMILIA = 'familia';
const CANAL_SOS = 'sos';

const chavePreferencias = (uid) => `@appintegrado:notificacoes:${uid}`;
const chaveMarcas = (uid) => `@appintegrado:notificacoes:marcas:${uid}`;

// ---------- Preferências (tela Configurações → Notificações) ----------

export async function lerPreferencias(uid) {
  try {
    const salvas = await AsyncStorage.getItem(chavePreferencias(uid));

    return { ...PREFERENCIAS_PADRAO, ...(salvas ? JSON.parse(salvas) : {}) };
  } catch (erro) {
    console.log('Preferências de notificação indisponíveis:', erro.message);
    return PREFERENCIAS_PADRAO;
  }
}

export async function salvarPreferencias(uid, preferencias) {
  await AsyncStorage.setItem(chavePreferencias(uid), JSON.stringify(preferencias));
}

/*
 * Marcas: até onde cada tipo de evento já foi avisado neste aparelho,
 * para não repetir avisos nem avisar o que aconteceu antes de a conta
 * usar as notificações pela primeira vez.
 *   { inicio, sos, convites, respostas, membros: ms, localizacao: { uid: ms } }
 */
export async function lerMarcas(uid, agora = Date.now()) {
  const inicio = {
    inicio: agora,
    sos: agora,
    convites: agora,
    respostas: agora,
    membros: agora,
    localizacao: {},
  };

  try {
    const salvas = await AsyncStorage.getItem(chaveMarcas(uid));

    if (salvas) return { ...inicio, ...JSON.parse(salvas) };

    await AsyncStorage.setItem(chaveMarcas(uid), JSON.stringify(inicio));
  } catch (erro) {
    console.log('Marcas de notificação indisponíveis:', erro.message);
  }

  return inicio;
}

export function salvarMarcas(uid, marcas) {
  return AsyncStorage.setItem(chaveMarcas(uid), JSON.stringify(marcas)).catch((erro) =>
    console.log('Marcas de notificação não salvas:', erro.message)
  );
}

// ---------- Eventos novos (funções puras) ----------

// ISO, milissegundos, Date ou Timestamp → milissegundos (ou null).
function paraMs(valor) {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  if (typeof valor === 'string') {
    const ms = Date.parse(valor);
    return Number.isNaN(ms) ? null : ms;
  }
  if (valor instanceof Date) return valor.getTime();
  if (typeof valor?.toMillis === 'function') return valor.toMillis();
  return null;
}

// Nomes dos convites ficam normalizados ("maria da silva").
const MINUSCULAS = ['da', 'das', 'de', 'do', 'dos', 'e'];

export function nomeParaExibir(nome) {
  return (nome || '')
    .split(' ')
    .map((parte, indice) =>
      indice > 0 && MINUSCULAS.includes(parte)
        ? parte
        : parte.charAt(0).toUpperCase() + parte.slice(1)
    )
    .join(' ');
}

// Maior horário entre a marca atual e os dos itens.
function avancar(marca, horarios) {
  return Math.max(marca, ...horarios.filter((ms) => ms !== null));
}

// SOS ativos de outros familiares, acionados depois da marca.
export function avisosDeSOS(alertas, uid, marca) {
  const deOutros = alertas.filter((alerta) => alerta.uid !== uid);
  const novos = deOutros.filter((alerta) => paraMs(alerta.criadoEm) > marca);

  return {
    marca: avancar(marca, deOutros.map((alerta) => paraMs(alerta.criadoEm))),
    avisos: novos.map((alerta) => ({
      tipo: 'sos',
      canal: CANAL_SOS,
      titulo: `SOS: ${alerta.nome || 'um familiar'} precisa de ajuda`,
      corpo:
        typeof alerta.latitude === 'number'
          ? 'Abra o Conecta para ver a localização do alerta.'
          : 'Abra o Conecta para ver o alerta.',
    })),
  };
}

// Convites pendentes para mim, criados depois da marca.
export function avisosDeConvitesRecebidos(convites, marca) {
  const novos = convites.filter((convite) => paraMs(convite.criadoEm) > marca);

  return {
    marca: avancar(marca, convites.map((convite) => paraMs(convite.criadoEm))),
    avisos: novos.map((convite) => ({
      tipo: 'solicitacoes',
      titulo: 'Convite para uma família',
      corpo: `${convite.deNome || 'Alguém'} convidou você para a família ${convite.grupoNome || ''}.`.trim(),
    })),
  };
}

// Convites que eu enviei, respondidos depois da marca.
export function avisosDeRespostas(convites, marca) {
  const respondidos = convites.filter((convite) =>
    ['aceito', 'recusado'].includes(convite.status)
  );
  const novos = respondidos.filter((convite) => paraMs(convite.respondidoEm) > marca);

  return {
    marca: avancar(marca, respondidos.map((convite) => paraMs(convite.respondidoEm))),
    avisos: novos.map((convite) => {
      const nome = nomeParaExibir(convite.paraNome) || 'O convidado';
      const aceito = convite.status === 'aceito';

      return {
        tipo: aceito ? 'aprovacoes' : 'recusas',
        conviteId: convite.id,
        titulo: aceito ? 'Convite aceito' : 'Convite recusado',
        corpo: `${nome} ${aceito ? 'aceitou' : 'recusou'} seu convite para a família ${convite.grupoNome || ''}.`.trim(),
      };
    }),
  };
}

// Membros que entraram depois da marca (e depois de mim).
export function avisosDeMembros(membros, uid, marca) {
  const eu = membros.find((membro) => membro.id === uid);
  const limite = Math.max(marca, paraMs(eu?.entrouEm) ?? 0);
  const novos = membros.filter(
    (membro) => membro.id !== uid && paraMs(membro.entrouEm) > limite
  );

  return {
    marca: avancar(marca, membros.map((membro) => paraMs(membro.entrouEm))),
    avisos: novos.map((membro) => ({
      tipo: 'novosMembros',
      conviteId: membro.conviteId || null,
      titulo: 'Novo membro na família',
      corpo: `${membro.nome || 'Alguém'} entrou na família.`,
    })),
  };
}

/*
 * Localizações de familiares gravadas depois de "inicio" e pelo menos
 * INTERVALO_AVISO_LOCALIZACAO depois do último aviso daquele familiar.
 * marcas: { uid: ms do último aviso }.
 */
export function avisosDeLocalizacao(familiares, uid, marcas, inicio) {
  const novasMarcas = { ...marcas };
  const avisos = [];

  for (const familiar of familiares) {
    const id = familiar.uid || familiar.id;
    const em = paraMs(familiar.atualizadoEm);

    if (id === uid || em === null || em <= inicio) continue;

    const ultimo = marcas[id];

    if (ultimo !== undefined && em - ultimo < INTERVALO_AVISO_LOCALIZACAO) continue;

    novasMarcas[id] = em;

    const detalhes = [descreverCasa(familiar), familiar.rua].filter(Boolean).join(' · ');

    avisos.push({
      tipo: 'localizacaoAtualizada',
      titulo: `${familiar.nome || 'Um familiar'} atualizou a localização`,
      corpo: detalhes || 'Veja no mapa.',
    });
  }

  return { marcas: novasMarcas, avisos };
}

// ---------- Aparelho (expo-notifications) ----------

// Mostra o aviso mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function criarCanais() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_FAMILIA, {
    name: 'Família',
    importance: Notifications.AndroidImportance.HIGH,
  });

  await Notifications.setNotificationChannelAsync(CANAL_SOS, {
    name: 'SOS',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500, 250, 500],
  });
}

// { permitido, podePedir } sem abrir nenhum diálogo.
export async function estadoPermissao() {
  try {
    const { granted, canAskAgain } = await Notifications.getPermissionsAsync();

    return { permitido: granted, podePedir: canAskAgain };
  } catch (erro) {
    console.log('Permissão de notificação indisponível:', erro.message);
    return { permitido: false, podePedir: false };
  }
}

// Pede a permissão (se ainda der). No Android os canais vêm antes.
export async function pedirPermissao() {
  try {
    await criarCanais();

    const atual = await Notifications.getPermissionsAsync();

    if (atual.granted || !atual.canAskAgain) return atual.granted;

    const { granted } = await Notifications.requestPermissionsAsync();

    return granted;
  } catch (erro) {
    console.log('Permissão de notificação não obtida:', erro.message);
    return false;
  }
}

export async function notificar({ titulo, corpo, canal = CANAL_FAMILIA }) {
  try {
    const { permitido } = await estadoPermissao();

    if (!permitido) return;

    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: Platform.OS === 'android' ? { channelId: canal } : null,
    });
  } catch (erro) {
    console.log('Notificação não exibida:', erro.message);
  }
}
