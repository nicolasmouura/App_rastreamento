import { useEffect, useState } from 'react';

import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { cores, fontes } from '../theme/theme';

const ITENS = [
  {
    chave: 'notificacoes',
    label: 'Notificações',
    icone: 'bell',
  },
  {
    chave: 'localizacao',
    label: 'Localização',
    icone: 'map-pin',
  },
  {
    chave: 'seguranca',
    label: 'Segurança',
    icone: 'lock',
  },
];

const TIPOS_NOTIFICACAO = [
  {
    chave: 'solicitacoes',
    titulo: 'Solicitações de entrada',
    descricao:
      'Avisar quando alguém solicitar entrar na sua família.',
    icone: 'user-plus',
  },
  {
    chave: 'aprovacoes',
    titulo: 'Solicitações aprovadas',
    descricao:
      'Avisar quando sua entrada em uma família for aprovada.',
    icone: 'check-circle',
  },
  {
    chave: 'recusas',
    titulo: 'Solicitações recusadas',
    descricao:
      'Avisar quando sua solicitação de entrada for recusada.',
    icone: 'x-circle',
  },
  {
    chave: 'novosMembros',
    titulo: 'Novos membros',
    descricao:
      'Avisar quando um novo membro entrar na sua família.',
    icone: 'users',
  },
  {
    chave: 'localizacaoAtualizada',
    titulo: 'Atualizações de localização',
    descricao:
      'Avisar quando a localização de um familiar for atualizada.',
    icone: 'map-pin',
  },
];

const CONFIGURACOES_PADRAO = {
  solicitacoes: true,
  aprovacoes: true,
  recusas: true,
  novosMembros: true,
  localizacaoAtualizada: true,
};

export default function Configuracoes({ usuario, onSair }) {
  const [notificacoesAbertas, setNotificacoesAbertas] =
    useState(false);

  const [notificacoes, setNotificacoes] = useState(
    CONFIGURACOES_PADRAO
  );

  const chaveNotificacoes = usuario?.uid
    ? `@appintegrado:notificacoes:${usuario.uid}`
    : null;

  useEffect(() => {
    async function carregarConfiguracoes() {
      if (!chaveNotificacoes) {
        setNotificacoes(CONFIGURACOES_PADRAO);
        return;
      }

      try {
        const configuracoesSalvas =
          await AsyncStorage.getItem(chaveNotificacoes);

        if (configuracoesSalvas) {
          setNotificacoes({
            ...CONFIGURACOES_PADRAO,
            ...JSON.parse(configuracoesSalvas),
          });
        } else {
          setNotificacoes(CONFIGURACOES_PADRAO);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar configurações de notificações:',
          error
        );

        setNotificacoes(CONFIGURACOES_PADRAO);
      }
    }

    carregarConfiguracoes();
  }, [chaveNotificacoes]);

  async function alternarNotificacao(chave) {
    const novasConfiguracoes = {
      ...notificacoes,
      [chave]: !notificacoes[chave],
    };

    setNotificacoes(novasConfiguracoes);

    if (!chaveNotificacoes) {
      return;
    }

    try {
      await AsyncStorage.setItem(
        chaveNotificacoes,
        JSON.stringify(novasConfiguracoes)
      );
    } catch (error) {
      console.error(
        'Erro ao salvar configurações de notificações:',
        error
      );
    }
  }

  function tocarOpcao(chave) {
    if (chave === 'notificacoes') {
      setNotificacoesAbertas(true);
      return;
    }

    if (chave === 'localizacao') {
      Alert.alert(
        'Localização',
        'As configurações de localização serão implementadas aqui.'
      );
      return;
    }

    if (chave === 'seguranca') {
      Alert.alert(
        'Segurança',
        'As configurações de segurança serão implementadas aqui.'
      );
    }
  }

  function voltarConfiguracoes() {
    setNotificacoesAbertas(false);
  }

  function confirmarSaida() {
    Alert.alert(
      'Sair do aplicativo',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: onSair,
        },
      ]
    );
  }

  if (notificacoesAbertas) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.voltar}
          onPress={voltarConfiguracoes}
        >
          <Feather
            name="arrow-left"
            size={20}
            color={cores.texto}
          />

          <Text style={styles.voltarTexto}>
            Configurações
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Notificações
        </Text>

        <Text style={styles.subtitulo}>
          Escolha quais notificações você deseja receber.
        </Text>

        {TIPOS_NOTIFICACAO.map((item) => (
          <View
            key={item.chave}
            style={styles.notificacao}
          >
            <View style={styles.notificacaoIcone}>
              <Feather
                name={item.icone}
                size={19}
                color={cores.primaria}
              />
            </View>

            <View style={styles.notificacaoConteudo}>
              <Text style={styles.notificacaoTitulo}>
                {item.titulo}
              </Text>

              <Text style={styles.notificacaoDescricao}>
                {item.descricao}
              </Text>
            </View>

            <Switch
              value={notificacoes[item.chave]}
              onValueChange={() =>
                alternarNotificacao(item.chave)
              }
              trackColor={{
                false: cores.borda,
                true: cores.primaria,
              }}
              thumbColor={cores.superficie}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Configurações
      </Text>

      {ITENS.map((item) => (
        <TouchableOpacity
          key={item.chave}
          style={styles.item}
          onPress={() => tocarOpcao(item.chave)}
        >
          <View style={styles.itemEsquerda}>
            <Feather
              name={item.icone}
              size={18}
              color={cores.textoSecundario}
            />

            <Text style={styles.itemText}>
              {item.label}
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={18}
            color={cores.textoSecundario}
          />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.itemSair}
        onPress={confirmarSaida}
      >
        <View style={styles.itemEsquerda}>
          <Feather
            name="log-out"
            size={18}
            color={cores.erro}
          />

          <Text style={styles.textoSair}>
            Sair do aplicativo
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 30,
  },

  title: {
    fontSize: 20,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 14,
    color: cores.textoSecundario,
    lineHeight: 20,
    marginBottom: 18,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  itemEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  itemText: {
    fontSize: 16,
    color: cores.texto,
  },

  itemSair: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  textoSair: {
    fontSize: 16,
    color: cores.erro,
    fontFamily: fontes.destaque,
  },

  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  voltarTexto: {
    fontSize: 15,
    color: cores.textoSecundario,
    fontFamily: fontes.destaque,
  },

  notificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  notificacaoIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  notificacaoConteudo: {
    flex: 1,
    paddingRight: 10,
  },

  notificacaoTitulo: {
    fontSize: 15,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 3,
  },

  notificacaoDescricao: {
    fontSize: 12,
    color: cores.textoSecundario,
    lineHeight: 17,
  },
});