import * as Clipboard from 'expo-clipboard';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cores, fontes, raio, sombra } from '../theme/theme';

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
          <Feather name="copy" size={16} color={cores.textoSobrePrimaria} />
          <Text style={styles.botaoTexto}>Copiar código</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoSecundario} onPress={compartilharConvite}>
          <Feather name="share-2" size={16} color={cores.primaria} />
          <Text style={styles.botaoSecundarioTexto}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 18,
    marginBottom: 20,
    borderRadius: raio.card,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    ...sombra,
  },

  label: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginBottom: 6,
  },

  codigo: {
    fontSize: 28,
    fontFamily: fontes.titulo,
    letterSpacing: 4,
    color: cores.primaria,
    marginBottom: 14,
  },

  botoes: {
    flexDirection: 'row',
    gap: 10,
  },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontFamily: fontes.destaque,
    fontSize: 14,
  },

  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: raio.botaoSecundario,
    borderWidth: 1,
    borderColor: cores.primaria,
  },

  botaoSecundarioTexto: {
    color: cores.primaria,
    fontFamily: fontes.destaque,
    fontSize: 14,
  },
});