import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Menu({ onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busca Familiar</Text>

      <Text style={styles.subtitle}>
        O que você deseja acessar?
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSelect('mapa')}
      >
        <Text style={styles.buttonText}>🗺️ Mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSelect('familia')}
      >
        <Text style={styles.buttonText}>👨‍👩‍👧 Minha Família</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSelect('camera')}
      >
        <Text style={styles.buttonText}>📷 Câmera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSelect('perfil')}
      >
        <Text style={styles.buttonText}>👤 Meu Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },

  button: {
    width: '90%',
    paddingVertical: 15,
    marginVertical: 7,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});