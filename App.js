import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import VerificaBiometria from './src/biometria/VerificaBiometria';
import Menu from './Components/Menu';
import TelaMapa from './src/mapa/TelaMapa';
import CameraScreen from './src/camera/CameraScreen';
import FamiliaScreen from './src/familia/FamiliaScreen';
import PerfilScreen from './src/perfil/PerfilScreen';
import { familiares as familiaresIniciais } from './src/dados/familiares';


// App.js guarda o ESTADO principal:
// - autenticado: se já passou pela biometria
// - tela: qual parte está aberta depois do login (menu | mapa | camera)
export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [tela, setTela] = useState('menu');
  const [familiares, setFamiliares] = useState(familiaresIniciais);

  const voltarMenu = () => setTela('menu');

  // Enquanto não autenticar, só existe a tela de login.
  if (!autenticado) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <VerificaBiometria onAutenticado={() => setAutenticado(true)} />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  let conteudo;

  if (tela === 'mapa'){
    conteudo = <TelaMapa familiares={familiares} />;
  } else if (tela === 'camera'){
    conteudo = < CameraScreen />;
  } else if (tela === 'familia'){
    conteudo = (
  <FamiliaScreen
    familiares={familiares}
    setFamiliares={setFamiliares}
  />
);
  } else if (tela === 'perfil'){
    conteudo = <PerfilScreen />;
  } else {
    conteudo = < Menu onSelect={setTela} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {conteudo}

        {tela !== 'menu' && (
          <TouchableOpacity style={styles.voltarButton} onPress={voltarMenu}>
            <Text style={styles.voltarText}>‹ Menu</Text>
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
    backgroundColor: '#fff',
  },
  voltarButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 20,
  },
  voltarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});