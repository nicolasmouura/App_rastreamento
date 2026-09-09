import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function AdicionarMembro({ onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>+ Adicionar membro</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },

  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});