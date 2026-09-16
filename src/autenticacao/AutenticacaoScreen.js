import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { salvarPerfilUsuario } from '../dados/salvarUsuario';
import { cores, fontes, raio } from '../theme/theme';

export default function AutenticacaoScreen({ onAutenticado }) {
  const [modoCadastro, setModoCadastro] = useState(true);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function continuar() {
    setErro('');
    setCarregando(true);

    try {
      if (modoCadastro) {
        if (!nome.trim()) {
          setErro('Digite seu nome.');
          setCarregando(false);
          return;
        }

        const resultado = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

        const usuario = {
          uid: resultado.user.uid,
          nome: nome.trim(),
          email: resultado.user.email,
        };

        await salvarPerfilUsuario(usuario);

        console.log('Conta criada:', usuario.uid);

        onAutenticado(usuario);
      } else {
        const resultado = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

        console.log('Login realizado:', resultado.user.uid);

        onAutenticado(resultado.user);
      }
    } catch (e) {
      console.error('Erro na autenticação:', e);

      if (e.code === 'auth/email-already-in-use') {
        setErro('Este e-mail já possui uma conta.');
      } else if (e.code === 'auth/invalid-email') {
        setErro('Digite um e-mail válido.');
      } else if (e.code === 'auth/weak-password') {
        setErro('A senha precisa ter pelo menos 6 caracteres.');
      } else if (
        e.code === 'auth/invalid-credential' ||
        e.code === 'auth/wrong-password'
      ) {
        setErro('E-mail ou senha incorretos.');
      } else {
        setErro('Não foi possível continuar. Tente novamente.');
      }
    }

    setCarregando(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Rastreamento Familiar
      </Text>

      <Text style={styles.subtitulo}>
        {modoCadastro
          ? 'Crie sua conta'
          : 'Entre na sua conta'}
      </Text>

      {modoCadastro && (
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor={cores.textoSecundario}
          value={nome}
          onChangeText={setNome}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={cores.textoSecundario}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={cores.textoSecundario}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.botao, carregando && styles.botaoDesabilitado]}
        onPress={continuar}
        disabled={carregando}
      >
        <Text style={styles.botaoTexto}>
          {carregando
            ? 'Aguarde...'
            : modoCadastro
            ? 'Criar minha conta'
            : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setModoCadastro(!modoCadastro);
          setErro('');
        }}
      >
        <Text style={styles.alternar}>
          {modoCadastro
            ? 'Já tenho uma conta'
            : 'Ainda não tenho uma conta'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: cores.fundo,
  },

  titulo: {
    fontSize: 26,
    fontFamily: fontes.titulo,
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    color: cores.textoSecundario,
    marginBottom: 30,
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

  botao: {
    backgroundColor: cores.primaria,
    padding: 16,
    borderRadius: raio.pilula,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  alternar: {
    textAlign: 'center',
    color: cores.primaria,
    fontSize: 15,
  },

  erro: {
    color: cores.erro,
    textAlign: 'center',
    marginBottom: 10,
  },
});