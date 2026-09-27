import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

export const TAREFA_LOCALIZACAO = 'conecta-localizacao-background';

TaskManager.defineTask(TAREFA_LOCALIZACAO, async ({ data, error }) => {
  if (error) {
    console.error('Erro na tarefa de localização:', error);
    return;
  }

  if (!data) {
    return;
  }

  const { locations } = data;

  if (!locations || locations.length === 0) {
    return;
  }

  const ultimaLocalizacao = locations[locations.length - 1];
  const coordenadas = ultimaLocalizacao.coords;

  try {
    const usuarioSalvo = await SecureStore.getItemAsync(
      'conecta_usuario_localizacao'
    );

    if (!usuarioSalvo) {
      console.error(
        'Usuário não encontrado para atualização em segundo plano.'
      );
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    await setDoc(
      doc(db, 'familiares', usuario.uid),
      {
        nome: usuario.nome,
        grupoId: usuario.grupoId,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        online: true,
      },
      { merge: true }
    );

    console.log(
      'Localização em segundo plano atualizada:',
      coordenadas.latitude,
      coordenadas.longitude
    );
  } catch (erro) {
    console.error(
      'Erro ao atualizar localização em segundo plano:',
      erro
    );
  }
});