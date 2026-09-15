import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DadosUsuario from './DadosUsuario';
import Configuracoes from './Configuracoes';
import CameraScreen from '../camera/CameraScreen';

const CHAVE_FOTO = '@appintegrado:fotoPerfil';

export default function PerfilScreen() {
  const [abrirCamera, setAbrirCamera] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  // Carrega a foto salva assim que a tela monta (inclusive depois de reabrir o app)
  useEffect(() => {
    async function carregarFotoSalva() {
      try {
        const uriSalva = await AsyncStorage.getItem(CHAVE_FOTO);
        if (uriSalva) {
          setFotoPerfil(uriSalva);
        }
      } catch (error) {
        console.error('Erro ao carregar foto salva:', error);
      }
    }

    carregarFotoSalva();
  }, []);

  // Salva a foto tanto no estado (pra aparecer na hora) quanto no AsyncStorage (pra persistir)
  async function salvarFoto(uri) {
    setFotoPerfil(uri);

    try {
      await AsyncStorage.setItem(CHAVE_FOTO, uri);
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    }
  }

  function escolherFoto() {
    Alert.alert(
      'Alterar foto de perfil',
      'Como você quer escolher a foto?',
      [
        { text: 'Tirar foto', onPress: () => setAbrirCamera(true) },
        { text: 'Escolher da galeria', onPress: escolherDaGaleria },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }

  async function escolherDaGaleria() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o acesso às fotos.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets?.[0]?.uri) {
        salvarFoto(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao escolher da galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <DadosUsuario
        foto={fotoPerfil}
        onAlterarFoto={escolherFoto}
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