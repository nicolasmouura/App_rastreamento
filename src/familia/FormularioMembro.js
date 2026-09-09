import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Parentesco"
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
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
  },

  title: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },

  input: {
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  addButton: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 'bold',
  },
});