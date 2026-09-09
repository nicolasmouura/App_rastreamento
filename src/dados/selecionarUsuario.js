import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { salvarUsuario } from './usuario';

const usuarios = [
  {
    uid: 'joao-001',
    nome: 'João',
    parentesco: 'Irmão',
  },
  {
    uid: 'maria-001',
    nome: 'Maria',
    parentesco: 'Mãe',
  },
  {
    uid: 'pedro-001',
    nome: 'Pedro',
    parentesco: 'Pai',
  },
];

export default function SelecionarUsuario({ onSelecionado }) {
  const [salvando, setSalvando] = useState(false);

  async function selecionar(usuario) {
    setSalvando(true);

    await salvarUsuario(usuario.uid);

    console.log('Usuário selecionado:', usuario.uid);

    onSelecionado(usuario.uid);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Quem está usando este aparelho?
      </Text>

      <Text style={styles.subtitulo}>
        Selecione o familiar que está usando este celular.
      </Text>

      {usuarios.map((usuario) => (
        <TouchableOpacity
          key={usuario.uid}
          style={styles.botao}
          onPress={() => selecionar(usuario)}
          disabled={salvando}
        >
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.parentesco}>{usuario.parentesco}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },

  botao: {
    width: '90%',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },

  nome: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  parentesco: {
    color: '#fff',
    marginTop: 4,
  },
});