import { StyleSheet, Text, View } from 'react-native';

export default function MembroCard({ nome, parentesco, online }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {nome.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>

        <Text style={styles.parentesco}>
          {parentesco}
        </Text>

        <Text
          style={[
            styles.status,
            online ? styles.online : styles.offline,
          ]}
        >
          {online
            ? '🟢 Localização ativa'
            : '🔴 Localização desativada'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#2563eb',
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  info: {
    gap: 4,
  },

  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },

  parentesco: {
    fontSize: 14,
    color: '#6b7280',
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