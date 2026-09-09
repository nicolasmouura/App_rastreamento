import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';
import { observarFamiliares } from '../dados/buscarFamiliares';

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

import { buscarUsuario, salvarUsuario } from '../dados/usuario';

export default function TelaMapa() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [familiares, setFamiliares] = useState([]);
  const [uidUsuario, setUidUsuario] = useState(null);

  // Usuário deste aparelho
  useEffect(() => {
  async function carregarUsuario() {
    let uid = await buscarUsuario();

    if (!uid) {
      await salvarUsuario('joao-001');
      uid = 'joao-001';
      console.log('Usuário criado neste aparelho:', uid);
    }

    setUidUsuario(uid);

    console.log('Usuário deste aparelho:', uid);
  }

  carregarUsuario();
}, []);

  // Rastreamento da localização
useEffect(() => {
  if (!uidUsuario) {
    return;
  }

  let subscription;

  async function iniciarRastreamento() {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Permissão da localização negada!');
      return;
    }

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
            doc(db, 'familiares', uidUsuario),
            {
              latitude: coordenadas.latitude,
              longitude: coordenadas.longitude,
              online: true,
            },
            { merge: true }
          );

          console.log(
            'Localização atualizada para:',
            uidUsuario,
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
  }

  iniciarRastreamento();

  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
}, [uidUsuario]);

  // Familiares vindos do Firebase em tempo real
  useEffect(() => {
    const cancelar = observarFamiliares((dados) => {
      setFamiliares(dados);
    });

    return () => cancelar();
  }, []);

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