import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MarcadorFamilia from './MarcadorFamilia';

export default function Mapa({ location, familiares }) {
  const latitude = location?.latitude ?? -22.5245;
  const longitude = location?.longitude ?? -43.6815;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
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

      {/* Familiar */}
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