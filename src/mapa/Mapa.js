import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import MarcadorFamilia from './MarcadorFamilia';

export default function Mapa({ location, familiares }) {
  const mapaRef = useRef(null);
  const mapaPronto = useRef(false);
  const jaCentralizou = useRef(false);

  const latitude = location?.latitude ?? -22.5245;
  const longitude = location?.longitude ?? -43.6815;

  const centralizarNaLocalizacao = () => {
    if (
      !mapaRef.current ||
      !mapaPronto.current ||
      !location
    ) {
      return;
    }

    mapaRef.current.animateCamera(
      {
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        zoom: 17,
      },
      {
        duration: 800,
      }
    );

    jaCentralizou.current = true;
  };

  useEffect(() => {
    if (!location) {
      return;
    }

    centralizarNaLocalizacao();
  }, [location]);

  return (
    <MapView
      ref={mapaRef}
      style={styles.map}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onMapReady={() => {
        mapaPronto.current = true;

        if (!jaCentralizou.current) {
          centralizarNaLocalizacao();
        }
      }}
    >
      {/* Minha localização */}
      {location && (
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Você"
          description="Sua localização atual"
        />
      )}

      {/* Familiares */}
      {familiares.map((membro) => (
        <MarcadorFamilia
          key={membro.id}
          membro={membro}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});