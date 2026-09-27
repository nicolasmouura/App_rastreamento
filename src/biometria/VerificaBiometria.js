import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
  autenticarComBiometria,
  biometriaDisponivel,
  decidirInicioBiometria,
  lerFalhas,
  lerPreferencia,
  MAXIMO_FALHAS,
  proximoPasso,
  registrarFalha,
  zerarFalhas,
} from '../dados/biometria';
import { cores, fontes, raio } from '../theme/theme';

// Espera o usuário parar de digitar o e-mail antes de abrir a biometria.
const ESPERA_APOS_DIGITAR = 600;

/*
 * Parte biométrica da tela de login (não é uma tela à parte).
 * Quando o e-mail digitado é o da sessão guardada neste aparelho e a
 * biometria está ativada, abre a biometria automaticamente.
 *   sucesso     → onDesbloqueado()
 *   3 falhas,
 *   bloqueio ou
 *   indisponível → encerra o fluxo e pede a senha (onUsarSenha)
 *   cancelar    → não conta; permite tentar de novo ou usar a senha
 */
export default function VerificaBiometria({ email, sessao, onDesbloqueado, onUsarSenha }) {
  // inativo | autenticando | aguardando | encerrado
  const [etapa, setEtapa] = useState('inativo');
  const [mensagem, setMensagem] = useState('');
  const [config, setConfig] = useState(null);

  const falhasRef = useRef(0);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // Preferência, disponibilidade e contador da sessão guardada.
  useEffect(() => {
    if (!sessao?.uid) {
      setConfig(null);
      return;
    }

    let ativo = true;

    Promise.all([lerPreferencia(sessao.uid), biometriaDisponivel(), lerFalhas(sessao.uid)])
      .then(([preferencia, disponivel, falhas]) => {
        if (!ativo) return;
        falhasRef.current = falhas;
        setConfig({ preferencia, disponivel });
      })
      .catch((erro) => console.log('Configuração de biometria indisponível:', erro));

    return () => {
      ativo = false;
    };
  }, [sessao?.uid]);

  function encerrar(texto) {
    setEtapa('encerrado');
    setMensagem(texto);
    onUsarSenha();
  }

  async function tentar() {
    setEtapa('autenticando');
    setMensagem('');

    const classificacao = await autenticarComBiometria();
    const passo = proximoPasso(classificacao, falhasRef.current);

    if (!montado.current) return;

    if (classificacao === 'sucesso') {
      await zerarFalhas(sessao.uid);
      onDesbloqueado();
      return;
    }

    if (classificacao === 'falha') {
      falhasRef.current = await registrarFalha(sessao.uid);
    }

    if (!montado.current) return;

    if (passo.acao === 'senha') {
      encerrar(passo.mensagem);
    } else {
      setEtapa('aguardando');
      setMensagem(passo.mensagem);
    }
  }

  // Abre a biometria sozinha UMA vez quando o e-mail corresponde.
  // Depois de encerrado (senha escolhida, 3 falhas, bloqueio), não reabre.
  useEffect(() => {
    if (!config || etapa === 'autenticando') return;

    const decisao = decidirInicioBiometria({
      emailDigitado: email,
      sessao,
      preferencia: config.preferencia,
      disponivel: config.disponivel,
      falhas: falhasRef.current,
    });

    if (decisao === 'nao_se_aplica') {
      // Outro e-mail: esconde a biometria. Se o fluxo já foi
      // encerrado, continua encerrado (não reabre sozinho).
      if (etapa === 'aguardando') setEtapa('inativo');
      setMensagem('');
      return;
    }

    if (etapa !== 'inativo') return;

    if (decisao === 'senha_por_falhas') {
      encerrar(proximoPasso('falha', MAXIMO_FALHAS - 1).mensagem);
      return;
    }

    if (decisao === 'indisponivel') {
      encerrar(proximoPasso('indisponivel', falhasRef.current).mensagem);
      return;
    }

    const espera = setTimeout(tentar, ESPERA_APOS_DIGITAR);

    return () => clearTimeout(espera);
  }, [email, config, etapa]);

  if (etapa === 'inativo') {
    return null;
  }

  if (etapa === 'encerrado') {
    return mensagem ? <Text style={styles.aviso}>{mensagem}</Text> : null;
  }

  return (
    <View style={styles.caixa}>
      {etapa === 'autenticando' ? (
        <View style={styles.linha}>
          <ActivityIndicator color={cores.primaria} />
          <Text style={styles.texto}>Aguardando biometria...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.texto}>{mensagem}</Text>

          <TouchableOpacity style={styles.botao} onPress={tentar}>
            <Feather name="unlock" size={16} color={cores.textoSobrePrimaria} />
            <Text style={styles.botaoTexto}>Tentar biometria novamente</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.usarSenha}
        onPress={() => encerrar('')}
        disabled={etapa === 'autenticando'}
      >
        <Text style={styles.usarSenhaTexto}>Usar senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    padding: 14,
    marginBottom: 16,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlternativa,
    gap: 10,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  texto: {
    fontSize: 14,
    color: cores.texto,
    textAlign: 'center',
  },

  aviso: {
    fontSize: 14,
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 12,
  },

  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 15,
    fontFamily: fontes.destaque,
  },

  usarSenha: {
    alignItems: 'center',
    paddingVertical: 4,
  },

  usarSenhaTexto: {
    color: cores.primaria,
    fontSize: 15,
    fontFamily: fontes.destaque,
  },
});
