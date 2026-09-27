import { useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { enviarConvite, mensagemDeErro } from '../dados/convites';
import { cores, fontes, raio } from '../theme/theme';

export default function ConvidarMembro({
  visivel,
  grupo,
  remetente,
  onFechar,
}) {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    setEmail('');
    setErro('');
    setSucesso('');
    onFechar();
  }

  async function enviar() {
    if (!email.trim()) {
      setErro('Digite o e-mail da pessoa.');
      return;
    }

    try {
      setErro('');
      setSucesso('');
      setEnviando(true);

      await enviarConvite({ grupo, remetente, email });

      setEmail('');
      setSucesso('Convite enviado com sucesso.');
    } catch (e) {
      console.error('Erro ao enviar convite:', e);
      setErro(mensagemDeErro(e, 'Não foi possível enviar o convite.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={fechar}
    >
      <View style={styles.fundo}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Convidar familiar</Text>

          <Text style={styles.texto}>
            Digite o e-mail que a pessoa usa para entrar no Conecta.
            Ela verá o convite ao abrir o aplicativo.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="email@exemplo.com"
            placeholderTextColor={cores.textoSecundario}
            value={email}
            onChangeText={(texto) => {
              setEmail(texto);
              setErro('');
              setSucesso('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!enviando}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          {sucesso ? <Text style={styles.sucesso}>✓ {sucesso}</Text> : null}

          <TouchableOpacity
            style={[styles.botao, enviando && styles.botaoDesabilitado]}
            onPress={enviar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color={cores.textoSobrePrimaria} />
            ) : (
              <Text style={styles.botaoTexto}>Enviar convite</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoFechar}
            onPress={fechar}
            disabled={enviando}
          >
            <Text style={styles.botaoFecharTexto}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },

  titulo: {
    fontSize: 24,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 12,
    textAlign: 'center',
  },

  texto: {
    textAlign: 'center',
    color: cores.textoSecundario,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.botaoSecundario + 4,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: cores.superficie,
    color: cores.texto,
  },

  erro: {
    color: cores.erro,
    textAlign: 'center',
    marginBottom: 10,
  },

  sucesso: {
    color: cores.online,
    fontFamily: fontes.destaque,
    textAlign: 'center',
    marginBottom: 10,
  },

  botao: {
    width: '100%',
    padding: 15,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  botaoFechar: {
    padding: 12,
  },

  botaoFecharTexto: {
    color: cores.textoSecundario,
    fontSize: 15,
  },
});
