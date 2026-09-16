import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { cores, fontes, raio } from '../theme/theme';

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
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
  },

  text: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },
});