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

import { useFonts, Poppins_700Bold, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from './src/config/firebase';

import Menu from './Components/Menu';
import TelaMapa from './src/mapa/TelaMapa';
import CameraScreen from './src/camera/CameraScreen';
import FamiliaScreen from './src/familia/FamiliaScreen';
import PerfilScreen from './src/perfil/PerfilScreen';

import { familiares as familiaresIniciais } from './src/dados/familiares';

import AutenticacaoScreen from './src/autenticacao/AutenticacaoScreen';
import GrupoScreen from './src/grupo/GrupoScreen';

import { cores, fontes, raio } from './src/theme/theme';


export default function App() {

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
  });

  // Usuário logado (vindo do login/cadastro)
  const [usuario, setUsuario] = useState(null);

  // Dados reais do perfil (nome/email) vindos do Firestore
  const [perfil, setPerfil] = useState(null);

  // Id do grupo familiar do usuário
  const [grupoId, setGrupoId] = useState(null);

  // Grupo do usuário
  const [temGrupo, setTemGrupo] = useState(false);

    // Usuário optou por pular a criação/entrada em grupo por agora
  const [pulouGrupo, setPulouGrupo] = useState(false);

  // Verificação do grupo ainda não terminou
  const [verificandoGrupo, setVerificandoGrupo] = useState(false);

  // Tela atual
  const [tela, setTela] = useState('menu');

  // Familiares
  const [familiares, setFamiliares] = useState(
    familiaresIniciais
  );


  /*
   * Verifica se o usuário já possui um grupo
   * e busca os dados reais do perfil (nome/email).
   */
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

        const resultado = await getDoc(referencia);

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

            setGrupoId(dadosUsuario.grupoId);
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

          // Ainda assim mostramos o que temos (ex.: login sem doc criado)
          setPerfil({
            uid: usuario.uid,
            nome: usuario.nome || usuario.displayName || 'Usuário',
            email: usuario.email,
          });

          setGrupoId(null);
          setTemGrupo(false);
        }

      } catch (e) {

        console.error(
          'Erro ao verificar grupo:',
          e
        );

        setTemGrupo(false);

      } finally {

        setVerificandoGrupo(false);
      }
    }

    verificarGrupo();

  }, [usuario]);


  if (!fontsLoaded) {
    return null;
  }


  /*
   * Voltar para o menu.
   */
  const voltarMenu = () => {
    setTela('menu');
  };


  /*
   * 1 — Ainda não está logado.
   */
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

              setUsuario(usuarioFirebase);

            }}
          />

          <StatusBar style="auto" />

        </View>

      </SafeAreaProvider>
    );
  }


  /*
   * 2 — Está verificando se possui grupo.
   */
  if (verificandoGrupo) {

    return (
      <SafeAreaProvider>

        <View style={styles.carregandoContainer}>

          <Text style={styles.carregandoTexto}>
            Verificando grupo familiar...
          </Text>

          <StatusBar style="auto" />

        </View>

      </SafeAreaProvider>
    );
  }


  /*
   * 3 — Usuário não possui grupo.
   *
   * Aqui mostramos a tela:
   *
   * "Grupo Familiar"
   * Criar grupo
   * Entrar com código
   */
  if (!temGrupo && !pulouGrupo) {

    return (
      <SafeAreaProvider>

        <View style={styles.container}>

          <GrupoScreen
            usuario={usuario}
            onGrupoConcluido={(novoGrupoId) => {

              console.log(
                'Grupo concluído.'
              );

              setGrupoId(novoGrupoId);
              setTemGrupo(true);

            }}
            
            onPular={() => setPulouGrupo(true)}

          />

          <StatusBar style="auto" />

        </View>

      </SafeAreaProvider>
    );
  }


  /*
   * 4 — Usuário possui grupo.
   *
   * Agora liberamos o aplicativo.
   */

  let conteudo;


    if (tela === 'mapa') {

    conteudo = (
      <TelaMapa
        familiares={familiares}
        usuario={perfil}
        grupoId={grupoId}
      />
    );

  } else if (tela === 'camera') {

    conteudo = (
      <CameraScreen />
    );

  } else if (tela === 'familia') {

    conteudo = (
      <FamiliaScreen
        familiares={familiares}
        setFamiliares={setFamiliares}
        grupoId={grupoId}
        usuario={perfil}
        onGrupoConcluido={(novoGrupoId) => {
          setGrupoId(novoGrupoId);
          setTemGrupo(true);
        }}
      />
    );

  } else if (tela === 'perfil') {

    conteudo = (
      <PerfilScreen
        usuario={perfil}
      />
    );

  } else {

    conteudo = (
      <Menu
        onSelect={setTela}
      />
    );
  }


  /*
   * Tela principal do aplicativo.
   */
  return (
    <SafeAreaProvider>

      <View style={styles.container}>

        {conteudo}


        {tela !== 'menu' && (

          <TouchableOpacity
            style={styles.voltarButton}
            onPress={voltarMenu}
          >

            <Text style={styles.voltarText}>
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

    backgroundColor: 'rgba(31, 42, 46, 0.75)',

    zIndex: 20,
  },


  voltarText: {
    color: '#fff',

    fontFamily: fontes.destaque,

    fontSize: 14,
  },

});