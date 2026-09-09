import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DadosUsuario from './DadosUsuario';
import Configuracoes from './Configuracoes';
import CameraScreen from '../camera/CameraScreen';

export default function PerfilScreen() {
  const [abrirCamera, setAbrirCamera] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  function abrirCameraPerfil() {
    setAbrirCamera(true);
  }

  function receberFoto(uri) {
    setFotoPerfil(uri);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <DadosUsuario
        foto={fotoPerfil}
        onAlterarFoto={abrirCameraPerfil}
      />

      <Configuracoes />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});