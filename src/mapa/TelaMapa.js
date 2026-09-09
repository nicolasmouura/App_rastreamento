import { StyleSheet, View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';

// Igual ao App.js do ToDo: aqui fica o ESTADO e a LÓGICA
// (pedir permissão, buscar localização). Os componentes filhos
// (Mapa e StatusLocalizacao) só recebem dados via props.
export default function TelaMapa({ familiares }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão da localização negada!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
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
