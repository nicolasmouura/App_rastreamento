import { StyleSheet, Text, View } from 'react-native';

export default function MembroCard({ nome, status }) {
  const online = status === 'online';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>

        <Text style={[styles.status, online ? styles.online : styles.offline]}>
          {online ? '🟢 Localização ativa' : '🔴 Localização desativada'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },

  info: {
    gap: 5,
  },

  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  status: {
    fontSize: 14,
  },

  online: {
    color: '#16a34a',
  },

  offline: {
    color: '#dc2626',
  },
});