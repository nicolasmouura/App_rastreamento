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
      !location ||
      jaCentralizou.current
    ) {
      return;
    }

    // Marca antes da animação para impedir
    // que as próximas atualizações da localização
    // façam o mapa se mover novamente.
    jaCentralizou.current = true;

    // Pequeno intervalo para o mapa aparecer
    // antes de iniciar o efeito.
    setTimeout(() => {
      if (!mapaRef.current) {
        return;
      }

      mapaRef.current.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 17,
          pitch: 0,
          heading: 0,
        },
        {
          duration: 1400,
        }
      );
    }, 300);
  };

  useEffect(() => {
    if (!location || !mapaPronto.current) {
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
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }}
      onMapReady={() => {
        mapaPronto.current = true;

        if (!jaCentralizou.current && location) {
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