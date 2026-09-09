import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ListaMembros from './ListaMembros';
import AdicionarMembro from './AdicionarMembro';
import FormularioMembro from './FormularioMembro';

export default function FamiliaScreen({ familiares, setFamiliares }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);


  const adicionarMembro = () => {
  setMostrarFormulario(true);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Família</Text>

      <Text style={styles.subtitle}>
        Pessoas que compartilham a localização com você
      </Text>

      <ListaMembros membros={familiares} />

{mostrarFormulario ? (
  <FormularioMembro
    onAdicionar={(novoMembro) => {
      const membro = {
        id: Date.now(),
        nome: novoMembro.nome,
        parentesco: novoMembro.parentesco,
        latitude: -22.5245,
        longitude: -43.6815,
        online: false,
      };

      setFamiliares((atual) => [...atual, membro]);
      setMostrarFormulario(false);
    }}
    onCancelar={() => setMostrarFormulario(false)}
  />
) : (
  <AdicionarMembro onPress={adicionarMembro} />
)}
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