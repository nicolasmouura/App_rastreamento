import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { salvarPerfilUsuario } from '../dados/salvarUsuario';
import { cores, fontes, raio } from '../theme/theme';

export default function AutenticacaoScreen({ onAutenticado }) {
  const [tela, setTela] = useState('inicio');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function continuar() {
    setErro('');
    setCarregando(true);

    try {
      if (tela === 'cadastro') {
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

  function abrirTela(tipo) {
    setErro('');
    setTela(tipo);
  }

  function voltarInicio() {
    setErro('');
    setTela('inicio');
  }

  if (tela === 'inicio') {
    return (
      <View style={styles.container}>
        <View style={styles.inicio}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.nomeApp}>
            Conecta
          </Text>

          <Text style={styles.bemVindo}>
            Bem-vindo!
          </Text>

          <Text style={styles.descricao}>
            Conecte sua família e acompanhe a localização
            de quem é importante para você.
          </Text>

          <View style={styles.botoesInicio}>
            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={() => abrirTela('login')}
            >
              <Text style={styles.botaoPrincipalTexto}>
                Entrar no app
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => abrirTela('cadastro')}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Se cadastrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const cadastro = tela === 'cadastro';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.formularioScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logoFormulario}
          resizeMode="contain"
        />

        <Text style={styles.nomeAppFormulario}>
          Conecta
        </Text>

        <Text style={styles.tituloFormulario}>
          {cadastro ? 'Criar sua conta' : 'Entrar no app'}
        </Text>

        <Text style={styles.subtituloFormulario}>
          {cadastro
            ? 'Preencha seus dados para começar.'
            : 'Entre para continuar usando o Conecta.'}
        </Text>

        {cadastro && (
          <>
            <Text style={styles.label}>
              Nome
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={cores.textoSecundario}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </>
        )}

        <Text style={styles.label}>
          E-mail
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Seu e-mail"
          placeholderTextColor={cores.textoSecundario}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>
          Senha
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor={cores.textoSecundario}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {erro ? (
          <Text style={styles.erro}>
            {erro}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.botaoPrincipal,
            carregando && styles.botaoDesabilitado,
          ]}
          onPress={continuar}
          disabled={carregando}
        >
          <Text style={styles.botaoPrincipalTexto}>
            {carregando
              ? 'Aguarde...'
              : cadastro
              ? 'Criar minha conta'
              : 'Entrar no app'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={voltarInicio}
          disabled={carregando}
        >
          <Text style={styles.botaoVoltarTexto}>
            ← Voltar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  inicio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  logo: {
    width: 125,
    height: 125,
    marginBottom: 8,
  },

  nomeApp: {
    fontSize: 42,
    fontFamily: fontes.titulo,
    color: cores.primaria,
    marginBottom: 18,
  },

  bemVindo: {
    fontSize: 27,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 12,
  },

  descricao: {
    width: '90%',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: cores.textoSecundario,
    marginBottom: 34,
  },

  botoesInicio: {
    width: '100%',
    gap: 12,
  },

  botaoPrincipal: {
    width: '100%',
    backgroundColor: cores.primaria,
    paddingVertical: 16,
    borderRadius: raio.pilula,
    alignItems: 'center',
  },

  botaoPrincipalTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  botaoSecundario: {
    width: '100%',
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    paddingVertical: 15,
    borderRadius: raio.pilula,
    alignItems: 'center',
  },

  botaoSecundarioTexto: {
    color: cores.primaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  formularioScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  logoFormulario: {
    width: 75,
    height: 75,
    alignSelf: 'center',
    marginBottom: 2,
  },

  nomeAppFormulario: {
    fontSize: 27,
    fontFamily: fontes.titulo,
    color: cores.primaria,
    textAlign: 'center',
    marginBottom: 22,
  },

  tituloFormulario: {
    fontSize: 26,
    fontFamily: fontes.titulo,
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 8,
  },

  subtituloFormulario: {
    fontSize: 15,
    textAlign: 'center',
    color: cores.textoSecundario,
    marginBottom: 28,
  },

  label: {
    fontSize: 14,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 6,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.botaoSecundario + 4,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: cores.superficie,
    color: cores.texto,
  },

  erro: {
    color: cores.erro,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoVoltar: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },

  botaoVoltarTexto: {
    color: cores.primaria,
    fontSize: 15,
    fontFamily: fontes.destaque,
  },
});