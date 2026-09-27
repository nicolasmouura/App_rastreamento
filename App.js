import { useEffect, useState } from 'react';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import {
  useFonts,
  Poppins_700Bold,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db } from './src/config/firebase';

import Menu from './Components/Menu';
import TelaMapa from './src/mapa/TelaMapa';
import CameraScreen from './src/camera/CameraScreen';
import FamiliaScreen from './src/familia/FamiliaScreen';
import PerfilScreen from './src/perfil/PerfilScreen';
import ExplorarScreen from './src/explorar/ExplorarScreen';
import ConquistaScreen from './src/conquista/ConquistaScreen';

import AutenticacaoScreen from './src/autenticacao/AutenticacaoScreen';
import GrupoScreen from './src/grupo/GrupoScreen';

import {
  cores,
  fontes,
  raio,
} from './src/theme/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
  });

  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [grupoId, setGrupoId] = useState(null);
  const [temGrupo, setTemGrupo] = useState(false);
  const [pulouGrupo, setPulouGrupo] = useState(false);
  const [verificandoGrupo, setVerificandoGrupo] = useState(false);
  const [tela, setTela] = useState('menu');

  // Ponto que está sendo registrado pela câmera
  const [pontoEmRegistro, setPontoEmRegistro] = useState(null);

  // Visitas/conquistas do usuário
  const [visitasExplorar, setVisitasExplorar] = useState([]);

  // Visita que acabou de gerar uma conquista
  const [visitaConquistada, setVisitaConquistada] = useState(null);

  useEffect(() => {
    async function verificarGrupo() {
      if (!usuario) {
        return;
      }

      try {
        setVerificandoGrupo(true);

        const referencia = doc(
          db,
          'usuarios',
          usuario.uid
        );

        const resultado = await getDoc(
          referencia
        );

        if (resultado.exists()) {
          const dadosUsuario = resultado.data();

          setPerfil({
            uid: usuario.uid,
            nome: dadosUsuario.nome,
            email: dadosUsuario.email,
          });

          if (dadosUsuario.grupoId) {
            console.log(
              'Grupo encontrado:',
              dadosUsuario.grupoId
            );

            setGrupoId(
              dadosUsuario.grupoId
            );

            setTemGrupo(true);
          } else {
            console.log(
              'Usuário ainda não possui grupo.'
            );

            setGrupoId(null);
            setTemGrupo(false);
          }
        } else {
          console.log(
            'Perfil do usuário não encontrado.'
          );

          setPerfil({
            uid: usuario.uid,
            nome:
              usuario.nome ||
              usuario.displayName ||
              'Usuário',
            email: usuario.email,
          });

          setGrupoId(null);
          setTemGrupo(false);
        }

        // Carrega as conquistas salvas do usuário
        const referenciaConquistas =
          collection(
            db,
            'usuarios',
            usuario.uid,
            'conquistas'
          );

        const resultadoConquistas =
          await getDocs(
            referenciaConquistas
          );

        const conquistas =
          resultadoConquistas.docs.map(
            (documento) => ({
              id: documento.id,
              ...documento.data(),
            })
          );

        setVisitasExplorar(conquistas);

        console.log(
          'Conquistas carregadas:',
          conquistas.length
        );
      } catch (e) {
        console.error(
          'Erro ao verificar grupo ou carregar conquistas:',
          e
        );

        setPerfil((perfilAtual) =>
          perfilAtual || {
            uid: usuario.uid,
            nome:
              usuario.nome ||
              usuario.displayName ||
              'Usuário',
            email: usuario.email,
          }
        );

        setTemGrupo(false);
        setVisitasExplorar([]);
      } finally {
        setVerificandoGrupo(false);
      }
    }

    verificarGrupo();
  }, [usuario]);

  if (!fontsLoaded) {
    return null;
  }

  const voltarMenu = () => {
    setTela('menu');
  };

  function abrirRegistroDeVisita(ponto) {
    console.log(
      'BOTÃO REGISTRAR CLICADO'
    );

    console.log(
      'Ponto:',
      ponto
    );

    setPontoEmRegistro(ponto);
    setTela('camera');
  }

  function cancelarRegistroDeVisita() {
    console.log(
      'Registro de visita cancelado.'
    );

    setPontoEmRegistro(null);
    setTela('explorar');
  }

  async function concluirRegistroDeVisita(
    fotoUri
  ) {
    if (!pontoEmRegistro || !usuario) {
      return;
    }

    const visita = {
      pontoId: pontoEmRegistro.id,
      nome: pontoEmRegistro.nome,
      categoria: pontoEmRegistro.categoria,
      fotoUri,
      registradaEm:
        new Date().toISOString(),
    };

    try {
      /*
       * Cada ponto possui um documento próprio.
       *
       * Isso impede que o mesmo usuário
       * registre o mesmo ponto várias vezes.
       */
      const referenciaConquista = doc(
        db,
        'usuarios',
        usuario.uid,
        'conquistas',
        pontoEmRegistro.id
      );

      await setDoc(
        referenciaConquista,
        visita
      );

      console.log(
        'Conquista salva no Firebase:',
        visita
      );

      setVisitasExplorar(
        (visitasAtuais) => {
          const jaVisitado =
            visitasAtuais.some(
              (visitaExistente) =>
                visitaExistente.pontoId ===
                pontoEmRegistro.id
            );

          if (jaVisitado) {
            return visitasAtuais;
          }

          return [
            ...visitasAtuais,
            {
              id: pontoEmRegistro.id,
              ...visita,
            },
          ];
        }
      );

      // Guarda a visita para mostrar a tela de conquista
      setVisitaConquistada(visita);

      // Limpa o ponto que estava sendo registrado
      setPontoEmRegistro(null);

      // Abre a tela de troféu
      setTela('conquista');
    } catch (erro) {
      console.error(
        'Erro ao salvar conquista:',
        erro
      );

      Alert.alert(
        'Não foi possível salvar',
        'A visita não pôde ser registrada. Verifique sua conexão e tente novamente.'
      );
    }
  }

  function sairDoAplicativo() {
    setUsuario(null);
    setPerfil(null);
    setGrupoId(null);
    setTemGrupo(false);
    setPulouGrupo(false);
    setPontoEmRegistro(null);
    setVisitasExplorar([]);
    setVisitaConquistada(null);
    setTela('menu');
  }

  if (!usuario) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <AutenticacaoScreen
            onAutenticado={(usuarioFirebase) => {
              console.log(
                'Usuário autenticado:',
                usuarioFirebase.uid
              );

              setUsuario(
                usuarioFirebase
              );
            }}
          />

          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (verificandoGrupo || !perfil) {
    return (
      <SafeAreaProvider>
        <View
          style={
            styles.carregandoContainer
          }
        >
          <Text
            style={
              styles.carregandoTexto
            }
          >
            Verificando grupo familiar...
          </Text>

          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!temGrupo && !pulouGrupo) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <GrupoScreen
            usuario={perfil}
            onGrupoConcluido={(
              novoGrupoId
            ) => {
              console.log(
                'Grupo concluído.'
              );

              setGrupoId(
                novoGrupoId
              );

              setTemGrupo(true);
            }}
            onPular={() =>
              setPulouGrupo(true)
            }
          />

          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  let conteudo;

  if (tela === 'mapa') {
    conteudo = (
      <TelaMapa
        usuario={perfil}
        grupoId={grupoId}
      />
    );
  } else if (tela === 'camera') {
    conteudo = (
      <CameraScreen
        onPhotoTaken={
          concluirRegistroDeVisita
        }
        onCancel={
          cancelarRegistroDeVisita
        }
      />
    );
  } else if (tela === 'familia') {
    conteudo = (
      <FamiliaScreen
        grupoId={grupoId}
        usuario={perfil}
        onGrupoConcluido={(
          novoGrupoId
        ) => {
          setGrupoId(
            novoGrupoId
          );

          setTemGrupo(true);
        }}
      />
    );
  } else if (tela === 'perfil') {
    conteudo = (
      <PerfilScreen
        usuario={perfil}
        visitas={visitasExplorar}
        onSair={sairDoAplicativo}
        onPerfilAtualizado={({ nome }) =>
          setPerfil((atual) => ({
            ...atual,
            nome,
          }))
        }
      />
    );
  } else if (tela === 'conquista') {
    conteudo = (
      <ConquistaScreen
        visita={visitaConquistada}
        onContinuar={() => {
          setVisitaConquistada(null);
          setTela('explorar');
        }}
      />
    );
  } else if (tela === 'explorar') {
    conteudo = (
      <ExplorarScreen
        visitas={visitasExplorar}
        onRegistrarVisita={
          abrirRegistroDeVisita
        }
      />
    );
  } else {
    conteudo = (
      <Menu
        onSelect={setTela}
        nome={perfil?.nome}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {conteudo}

        {tela !== 'menu' &&
          tela !== 'camera' &&
          tela !== 'conquista' && (
            <TouchableOpacity
              style={
                styles.voltarButton
              }
              onPress={
                voltarMenu
              }
            >
              <Text
                style={
                  styles.voltarText
                }
              >
                ‹ Menu
              </Text>
            </TouchableOpacity>
          )}

        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.fundo,
  },

  carregandoTexto: {
    fontSize: 16,
    color: cores.textoSecundario,
  },

  voltarButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: raio.pilula,
    backgroundColor:
      'rgba(31, 42, 46, 0.75)',
    zIndex: 20,
  },

  voltarText: {
    color: '#fff',
    fontFamily: fontes.destaque,
    fontSize: 14,
  },
});