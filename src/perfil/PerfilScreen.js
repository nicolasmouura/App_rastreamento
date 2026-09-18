import { useEffect, useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { signOut } from 'firebase/auth';

import DadosUsuario from './DadosUsuario';
import Configuracoes from './Configuracoes';
import CameraScreen from '../camera/CameraScreen';

import { auth } from '../config/firebase';
import { cores, fontes } from '../theme/theme';

export default function PerfilScreen({ usuario, onSair }) {
  const [abrirCamera, setAbrirCamera] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  const chaveFoto = usuario?.uid
    ? `@appintegrado:fotoPerfil:${usuario.uid}`
    : null;

  useEffect(() => {
    async function carregarFotoSalva() {
      if (!chaveFoto) {
        setFotoPerfil(null);
        return;
      }

      try {
        const uriSalva = await AsyncStorage.getItem(chaveFoto);
        setFotoPerfil(uriSalva || null);
      } catch (error) {
        console.error('Erro ao carregar foto salva:', error);
      }
    }

    carregarFotoSalva();
  }, [chaveFoto]);

  async function salvarFoto(uri) {
    setFotoPerfil(uri);

    if (!chaveFoto) return;

    try {
      await AsyncStorage.setItem(chaveFoto, uri);
    } catch (error) {
      console.error('Erro ao salvar foto:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar a foto.'
      );
    }
  }

  function escolherFoto() {
    Alert.alert(
      'Alterar foto de perfil',
      'Como você quer escolher a foto?',
      [
        {
          text: 'Tirar foto',
          onPress: () => setAbrirCamera(true),
        },
        {
          text: 'Escolher da galeria',
          onPress: escolherDaGaleria,
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
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !resultado.canceled &&
        resultado.assets?.[0]?.uri
      ) {
        await salvarFoto(resultado.assets[0].uri);
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

      console.log('Usuário saiu da conta.');

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Meu Perfil
      </Text>

      <DadosUsuario
        usuario={usuario}
        foto={fotoPerfil}
        onAlterarFoto={escolherFoto}
      />

      <Configuracoes
        usuario={usuario}
        onSair={sairDoAplicativo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: cores.fundo,
  },

  title: {
    fontSize: 26,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 30,
  },
});