import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';

import { observarFamiliares } from '../dados/buscarFamiliares';

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

import {
  TAREFA_LOCALIZACAO,
} from './localizacaoBackground';

export default function TelaMapa({ usuario, grupoId }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [familiares, setFamiliares] = useState([]);

  useEffect(() => {
    if (!usuario?.uid || !grupoId) {
      return;
    }

    let subscription;

    async function iniciarRastreamento() {
      try {
        const permissaoForeground =
          await Location.requestForegroundPermissionsAsync();

        if (permissaoForeground.status !== 'granted') {
          setErrorMsg('Permissão da localização negada!');
          return;
        }

        // Salva os dados necessários para o rastreamento
        // em segundo plano.
        await SecureStore.setItemAsync(
          'conecta_usuario_localizacao',
          JSON.stringify({
            uid: usuario.uid,
            nome: usuario.nome,
            grupoId: grupoId,
          })
        );

        // --------------------------------------------------
        // RASTREAMENTO NORMAL
        // --------------------------------------------------
        // Iniciamos primeiro para que o app continue
        // funcionando mesmo se o background não estiver
        // disponível no Expo Go.
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          async (novaLocalizacao) => {
            const coordenadas = novaLocalizacao.coords;

            setLocation(coordenadas);

            try {
              await setDoc(
                doc(db, 'familiares', usuario.uid),
                {
                  nome: usuario.nome,
                  grupoId: grupoId,
                  latitude: coordenadas.latitude,
                  longitude: coordenadas.longitude,
                  online: true,
                },
                { merge: true }
              );

              console.log(
                'Localização atualizada para:',
                usuario.uid,
                coordenadas.latitude,
                coordenadas.longitude
              );
            } catch (erro) {
              console.error(
                'Erro ao atualizar localização:',
                erro
              );
            }
          }
        );

        // --------------------------------------------------
        // RASTREAMENTO EM SEGUNDO PLANO
        // --------------------------------------------------
        // Se essa parte não funcionar no Expo Go,
        // não interrompe o rastreamento normal.
        try {
          const permissaoBackground =
            await Location.requestBackgroundPermissionsAsync();

          if (permissaoBackground.status === 'granted') {
            const tarefaAtiva =
              await Location.hasStartedLocationUpdatesAsync(
                TAREFA_LOCALIZACAO
              );

            if (!tarefaAtiva) {
              await Location.startLocationUpdatesAsync(
                TAREFA_LOCALIZACAO,
                {
                  accuracy: Location.Accuracy.High,
                  timeInterval: 5000,
                  distanceInterval: 10,

                  foregroundService: {
                    notificationTitle: 'Conecta',
                    notificationBody:
                      'O Conecta está atualizando sua localização.',
                    notificationColor: '#0754D9',
                  },

                  pausesUpdatesAutomatically: false,
                  showsBackgroundLocationIndicator: true,
                }
              );

              console.log(
                'Rastreamento em segundo plano iniciado.'
              );
            }
          } else {
            console.log(
              'Permissão de localização em segundo plano não concedida.'
            );
          }
        } catch (erroBackground) {
          console.log(
            'Localização em segundo plano não disponível neste ambiente:',
            erroBackground
          );
        }
      } catch (erro) {
        console.error(
          'Erro ao iniciar rastreamento:',
          erro
        );

        setErrorMsg(
          'Não foi possível iniciar o rastreamento da localização.'
        );
      }
    }

    iniciarRastreamento();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [usuario, grupoId]);

  // Familiares vindos do Firebase em tempo real
  useEffect(() => {
    if (!grupoId) {
      return;
    }

    const cancelar = observarFamiliares(
      grupoId,
      (dados) => {
        setFamiliares(dados);
      }
    );

    return () => cancelar();
  }, [grupoId]);

  let texto = 'Aguarde...';

  if (errorMsg) {
    texto = errorMsg;
  } else if (location) {
    texto = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" hidden />

      <Mapa
        location={location}
        familiares={familiares}
      />

      <StatusLocalizacao texto={texto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});