import { useEffect, useState } from 'react';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
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
} from 'firebase/firestore';

import { onAuthStateChanged, signOut } from 'firebase/auth';

import { auth, db } from './src/config/firebase';

import Menu from './Components/Menu';
import TelaMapa from './src/mapa/TelaMapa';
import FamiliaScreen from './src/familia/FamiliaScreen';
import PerfilScreen from './src/perfil/PerfilScreen';
import HistoricoScreen from './src/historico/HistoricoScreen';
import SOSScreen from './src/sos/SOSScreen';

import AutenticacaoScreen from './src/autenticacao/AutenticacaoScreen';
import { decidirAcessoRestaurado } from './src/dados/biometria';
import GrupoScreen from './src/grupo/GrupoScreen';
import { useCompartilharLocalizacao } from './src/mapa/compartilharLocalizacao';

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

  // Abertura do app: sessão restaurada pelo Firebase, travada até o
  // login destravá-la (biometria) ou ser feito com a senha.
  const [restaurandoSessao, setRestaurandoSessao] = useState(true);
  const [sessaoBloqueada, setSessaoBloqueada] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [grupoId, setGrupoId] = useState(null);
  const [temGrupo, setTemGrupo] = useState(false);
  const [pulouGrupo, setPulouGrupo] = useState(false);
  const [verificandoGrupo, setVerificandoGrupo] = useState(false);
  const [tela, setTela] = useState('menu');

  // Conquistas já registradas do usuário (exibidas no Perfil)
  const [visitasExplorar, setVisitasExplorar] = useState([]);

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

  // Só a PRIMEIRA emissão (sessão restaurada ao abrir) é tratada aqui.
  // Login, cadastro e "Sair" continuam pelos fluxos das telas.
  useEffect(() => {
    let primeira = true;

    const cancelar = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (!primeira) return;
      primeira = false;

      try {
        const decisao = await decidirAcessoRestaurado(usuarioFirebase);

        if (decisao === 'desbloquear') {
          setSessaoBloqueada(usuarioFirebase);
        }
      } catch (erro) {
        console.error('Erro ao restaurar sessão:', erro);
        await signOut(auth).catch(() => {});
      } finally {
        setRestaurandoSessao(false);
      }
    });

    return cancelar;
  }, []);

  // Compartilha a localização enquanto o app estiver em uso
  // (somente para usuário autenticado que pertence a uma família).
  const localizacao = useCompartilharLocalizacao(
    perfil,
    temGrupo ? grupoId : null
  );

  if (!fontsLoaded) {
    return null;
  }

  const voltarMenu = () => {
    setTela('menu');
  };

  function sairDoAplicativo() {
    setUsuario(null);
    setPerfil(null);
    setGrupoId(null);
    setTemGrupo(false);
    setPulouGrupo(false);
    setVisitasExplorar([]);
    setTela('menu');
  }

  if (!usuario && restaurandoSessao) {
    return (
      <SafeAreaProvider>
        <View style={styles.carregandoContainer}>
          <Text style={styles.carregandoTexto}>
            Carregando...
          </Text>

          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <AutenticacaoScreen
            sessaoRestaurada={sessaoBloqueada}
            onAutenticado={(usuarioFirebase) => {
              console.log(
                'Usuário autenticado:',
                usuarioFirebase.uid
              );

              setSessaoBloqueada(null);
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
        localizacao={localizacao}
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
  } else if (tela === 'sos') {
    conteudo = (
      <SOSScreen
        usuario={perfil}
        grupoId={temGrupo ? grupoId : null}
      />
    );
  } else if (tela === 'historico') {
    conteudo = (
      <HistoricoScreen
        usuario={perfil}
        grupoId={temGrupo ? grupoId : null}
      />
    );
  } else {
    conteudo = (
      <Menu
        onSelect={setTela}
        nome={perfil?.nome}
        localizacao={localizacao}
        grupoId={temGrupo ? grupoId : null}
        uidAtual={perfil?.uid}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {conteudo}

        {tela !== 'menu' && (
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