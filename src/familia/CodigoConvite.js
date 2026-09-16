import * as Clipboard from 'expo-clipboard';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CodigoConvite({ codigo, nomeGrupo }) {
  async function copiarCodigo() {
    await Clipboard.setStringAsync(codigo);
    Alert.alert('Copiado!', 'O código foi copiado para a área de transferência.');
  }

  async function compartilharConvite() {
    try {
      await Share.share({
        message: `Venha participar do meu grupo familiar "${nomeGrupo}"! Use o código ${codigo} para entrar no app.`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar convite:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Código de convite do grupo</Text>

      <Text style={styles.codigo}>{codigo}</Text>

      <View style={styles.botoes}>
        <TouchableOpacity style={styles.botao} onPress={copiarCodigo}>
          <Text style={styles.botaoTexto}>📋 Copiar código</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoSecundario} onPress={compartilharConvite}>
          <Text style={styles.botaoSecundarioTexto}>📤 Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },

  codigo: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#2563eb',
    marginBottom: 14,
  },

  botoes: {
    flexDirection: 'row',
    gap: 10,
  },

  botao: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },

  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  botaoSecundario: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
  },

  botaoSecundarioTexto: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
  },
});