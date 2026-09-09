import { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

export default function MarcadorFamilia({ membro }) {
  return (
    <Marker
      coordinate={{
        latitude: membro.latitude,
        longitude: membro.longitude,
      }}
      title={membro.nome || 'Familiar'}
      description={
        membro.online
          ? `${membro.parentesco} • Localização ativa`
          : `${membro.parentesco} • Localização desativada`
      }
    >
      <View style={styles.container}>
        <View style={styles.marcador}>
          <Text style={styles.inicial}>
  {(membro.nome || '?').charAt(0).toUpperCase()}
</Text>
        </View>

        <View style={styles.nomeContainer}>
          <Text style={styles.nome}>
  {membro.nome || 'Familiar'}
</Text>

          <Text style={styles.status}>
            {membro.online ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  marcador: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  nome: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },

  status: {
    fontSize: 10,
    color: '#6b7280',
  },
});