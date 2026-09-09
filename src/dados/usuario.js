import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_USUARIO = '@app_rastreamento_usuario';

export async function salvarUsuario(uid) {
  await AsyncStorage.setItem(CHAVE_USUARIO, uid);
}

export async function buscarUsuario() {
  return await AsyncStorage.getItem(CHAVE_USUARIO);
}

export async function removerUsuario() {
  await AsyncStorage.removeItem(CHAVE_USUARIO);
}