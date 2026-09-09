import { Alert, StyleSheet, Text, View } from 'react-native';

import ListaMembros from './ListaMembros';
import AdicionarMembro from './AdicionarMembro';

export default function FamiliaScreen() {
  const adicionarMembro = () => {
    Alert.alert(
      'Adicionar membro',
      'Aqui vamos criar o sistema para adicionar um membro da família.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Família</Text>

      <Text style={styles.subtitle}>
        Pessoas que compartilham a localização com você
      </Text>

      <ListaMembros />

      <AdicionarMembro onPress={adicionarMembro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    width: '90%',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 25,
  },
});