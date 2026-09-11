import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';
import { observarFamiliares } from '../dados/buscarFamiliares';

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function TelaMapa({ usuario, grupoId }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [familiares, setFamiliares] = useState([]);

  // Rastreamento da localização
  useEffect(() => {
    if (!usuario?.uid) {
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
    const cancelar = observarFamiliares(grupoId, (dados) => {
      setFamiliares(dados);
    });

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