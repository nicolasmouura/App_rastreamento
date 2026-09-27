import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { signOut } from 'firebase/auth';

import DadosUsuario from './DadosUsuario';
import Configuracoes from './Configuracoes';
import CameraScreen from '../camera/CameraScreen';

import { auth } from '../config/firebase';
import {
  atualizarPerfil,
  buscarPerfil,
  salvarFotoPerfil,
} from '../dados/salvarUsuario';
import { gerarMiniatura } from '../dados/fotoPerfil';
import {
  cores,
  fontes,
  raio,
  sombra,
} from '../theme/theme';

export default function PerfilScreen({
  usuario,
  onSair,
  onPerfilAtualizado,
  posicaoAtual,
  visitas = [],
}) {
  const [abrirCamera, setAbrirCamera] = useState(false);
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  // Dados pessoais vindos de usuarios/{uid}
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [erroPerfil, setErroPerfil] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      if (!usuario?.uid) {
        return;
      }

      try {
        setErroPerfil('');

        const perfilSalvo =
          await buscarPerfil(usuario.uid);

        if (ativo) {
          setDadosPerfil(perfilSalvo);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar perfil:',
          error
        );

        if (ativo) {
          setErroPerfil(
            'Não foi possível carregar seus dados.'
          );
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [usuario?.uid]);

  async function salvarPerfil(dados) {
    const salvos = await atualizarPerfil(
      usuario.uid,
      dados
    );

    setDadosPerfil((atual) => ({
      ...atual,
      ...salvos,
    }));

    if (onPerfilAtualizado) {
      onPerfilAtualizado(salvos);
    }

    return salvos;
  }

  /*
   * A foto vira uma miniatura (fotoPerfil.gerarMiniatura) e é salva em
   * usuarios/{uid}.foto: aparece em qualquer aparelho e para a família.
   */
  async function salvarFoto(uri) {
    try {
      setSalvandoFoto(true);

      const foto = await gerarMiniatura(uri);

      await salvarFotoPerfil(usuario.uid, foto);

      setDadosPerfil((atual) => ({ ...atual, foto }));
    } catch (error) {
      console.log(
        'Foto não salva:',
        error.code || error.message
      );

      Alert.alert(
        'Erro',
        'Não foi possível salvar a foto. Tente novamente.'
      );
    } finally {
      setSalvandoFoto(false);
    }
  }

  function escolherFoto() {
    Alert.alert(
      'Alterar foto de perfil',
      'Como você quer escolher a foto?',
      [
        {
          text: 'Tirar foto',
          onPress: () =>
            setAbrirCamera(true),
        },
        {
          text: 'Escolher da galeria',
          onPress:
            escolherDaGaleria,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }

  async function escolherDaGaleria() {
    try {
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o acesso às fotos.'
        );

        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions
                .Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          }
        );

      if (
        !resultado.canceled &&
        resultado.assets?.[0]?.uri
      ) {
        await salvarFoto(
          resultado.assets[0].uri
        );
      }
    } catch (error) {
      console.error(
        'Erro ao escolher da galeria:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível abrir a galeria.'
      );
    }
  }

  async function sairDoAplicativo() {
    try {
      await signOut(auth);

      console.log(
        'Usuário saiu da conta.'
      );

      if (onSair) {
        onSair();
      }
    } catch (error) {
      console.error(
        'Erro ao sair da conta:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível sair da conta. Tente novamente.'
      );
    }
  }

  function receberFoto(uri) {
    salvarFoto(uri);
    setAbrirCamera(false);
  }

  function cancelarCamera() {
    setAbrirCamera(false);
  }

  if (abrirCamera) {
    return (
      <CameraScreen
        onPhotoTaken={receberFoto}
        onCancel={cancelarCamera}
      />
    );
  }

  function renderConquista({ item }) {
    return (
      <View style={styles.conquistaCard}>
        <View style={styles.trofeu}>
          <Text style={styles.trofeuEmoji}>
            🏆
          </Text>
        </View>

        <View style={styles.conquistaInfo}>
          <Text style={styles.conquistaTitulo}>
            {item.nome}
          </Text>

          <Text style={styles.conquistaCategoria}>
            {item.categoria}
          </Text>

          <Text style={styles.conquistaData}>
            Conhecido em{' '}
            {new Date(
              item.registradaEm
            ).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.check}>
          <Text style={styles.checkTexto}>
            ✓
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <FlatList
        data={visitas}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) =>
          item.id || item.pontoId
        }
        renderItem={renderConquista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.conteudo
        }
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              Meu Perfil
            </Text>

            {dadosPerfil ? (
              <DadosUsuario
                perfil={dadosPerfil}
                salvandoFoto={salvandoFoto}
                onAlterarFoto={
                  escolherFoto
                }
              />
            ) : (
              <View
                style={
                  styles.carregandoPerfil
                }
              >
                {erroPerfil ? (
                  <Text
                    style={
                      styles.erroPerfil
                    }
                  >
                    {erroPerfil}
                  </Text>
                ) : (
                  <>
                    <ActivityIndicator
                      color={cores.primaria}
                    />

                    <Text
                      style={
                        styles.carregandoTexto
                      }
                    >
                      Carregando seus dados...
                    </Text>
                  </>
                )}
              </View>
            )}

            <View style={styles.secao}>
              <View
                style={
                  styles.tituloSecaoLinha
                }
              >
                <View>
                  <Text
                    style={
                      styles.tituloSecao
                    }
                  >
                    Minhas conquistas
                  </Text>

                  <Text
                    style={
                      styles.subtituloSecao
                    }
                  >
                    Lugares que você já conheceu
                  </Text>
                </View>

                <View
                  style={
                    styles.contador
                  }
                >
                  <Text
                    style={
                      styles.contadorNumero
                    }
                  >
                    {visitas.length}
                  </Text>

                  <Text
                    style={
                      styles.contadorTexto
                    }
                  >
                    {visitas.length === 1
                      ? 'lugar'
                      : 'lugares'}
                  </Text>
                </View>
              </View>

              {visitas.length === 0 && (
                <View
                  style={
                    styles.vazio
                  }
                >
                  <View
                    style={
                      styles.vazioIcone
                    }
                  >
                    <Text
                      style={
                        styles.vazioEmoji
                      }
                    >
                      🗺️
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.vazioTitulo
                    }
                  >
                    Nenhuma conquista ainda
                  </Text>

                  <Text
                    style={
                      styles.vazioTexto
                    }
                  >
                    Explore lugares, registre
                    suas visitas e comece a
                    montar sua coleção.
                  </Text>
                </View>
              )}
            </View>
          </>
        }
        ListFooterComponent={
          <View
            style={styles.rodape}
          >
            <Configuracoes
              usuario={usuario}
              perfil={dadosPerfil}
              onSalvarPerfil={salvarPerfil}
              posicaoAtual={posicaoAtual}
              onSair={
                sairDoAplicativo
              }
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  conteudo: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  carregandoPerfil: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
  },

  carregandoTexto: {
    fontSize: 15,
    color: cores.textoSecundario,
  },

  erroPerfil: {
    fontSize: 15,
    color: cores.erro,
    textAlign: 'center',
  },

  title: {
    fontSize: 26,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 30,
  },

  secao: {
    width: '100%',
    marginTop: 28,
    marginBottom: 14,
  },

  tituloSecaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  tituloSecao: {
    fontSize: 20,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  subtituloSecao: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 3,
  },

  contador: {
    minWidth: 58,
    height: 50,
    borderRadius: raio.card,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contadorNumero: {
    fontSize: 18,
    fontFamily: fontes.titulo,
    color: cores.primaria,
  },

  contadorTexto: {
    fontSize: 9,
    color: cores.textoSecundario,
  },

  conquistaCard: {
    width: '100%',
    minHeight: 82,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.card,
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...sombra,
  },

  trofeu: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  trofeuEmoji: {
    fontSize: 25,
  },

  conquistaInfo: {
    flex: 1,
  },

  conquistaTitulo: {
    fontSize: 15,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 2,
  },

  conquistaCategoria: {
    fontSize: 12,
    color: cores.primaria,
    marginBottom: 3,
  },

  conquistaData: {
    fontSize: 11,
    color: cores.textoSecundario,
  },

  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  checkTexto: {
    color: cores.online,
    fontSize: 17,
    fontFamily: fontes.destaque,
  },

  vazio: {
    width: '100%',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.card,
    padding: 24,
    alignItems: 'center',
    ...sombra,
  },

  vazioIcone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  vazioEmoji: {
    fontSize: 28,
  },

  vazioTitulo: {
    fontSize: 16,
    fontFamily: fontes.destaque,
    color: cores.texto,
    textAlign: 'center',
  },

  vazioTexto: {
    fontSize: 13,
    lineHeight: 19,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 290,
  },

  rodape: {
    marginTop: 12,
    width: '100%',
  },
});