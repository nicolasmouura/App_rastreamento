import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

export default function MarcadorFamilia({ membro }) {
  return (
    <Marker
      coordinate={{
        latitude: membro.latitude,
        longitude: membro.longitude,
      }}
      title={membro.nome}
    >
      <View style={styles.container}>
        <View style={styles.ponto}>
          <Text style={styles.inicial}>
            {membro.nome.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nomeContainer}>
          <Text style={styles.nome}>{membro.nome}</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  ponto: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  inicial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  nomeContainer: {
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  nome: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
});