import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { cores, fontes, raio } from '../theme/theme';

export default function FormularioMembro({ onAdicionar, onCancelar }) {
  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('');

  function adicionar() {
    if (!nome.trim() || !parentesco.trim()) {
      return;
    }

    onAdicionar({
      nome: nome.trim(),
      parentesco: parentesco.trim(),
    });

    setNome('');
    setParentesco('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar membro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor={cores.textoSecundario}
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Parentesco"
        placeholderTextColor={cores.textoSecundario}
        value={parentesco}
        onChangeText={setParentesco}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={adicionar}
      >
        <Text style={styles.buttonText}>Adicionar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancelar}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 20,
    padding: 20,
    borderRadius: raio.card,
    backgroundColor: cores.superficieAlternativa,
  },

  title: {
    marginBottom: 15,
    fontSize: 18,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  input: {
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: raio.botaoSecundario + 4,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    color: cores.texto,
  },

  addButton: {
    paddingVertical: 13,
    borderRadius: raio.pilula,
    alignItems: 'center',
    backgroundColor: cores.primaria,
  },

  buttonText: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: cores.erro,
    fontSize: 15,
    fontFamily: fontes.destaque,
  },
});