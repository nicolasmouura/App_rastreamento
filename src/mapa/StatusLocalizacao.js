import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/theme';

// Mostra o status/coordenadas atuais em um badge discreto sobre o mapa.
export default function StatusLocalizacao({ texto }) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 42, 46, 0.85)',
  },

  texto: {
    color: cores.superficie,
    fontSize: 12,
  },
});