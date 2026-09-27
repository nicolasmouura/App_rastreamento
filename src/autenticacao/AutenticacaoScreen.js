import { useRef, useState } from 'react';
import {
  Alert,
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
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import {
  salvarPerfilUsuario,
  validarCadastro,
} from '../dados/salvarUsuario';
import {
  deveOferecerBiometria,
  PREFERENCIA,
  salvarPreferencia,
  zerarFalhas,
} from '../dados/biometria';
import VerificaBiometria from '../biometria/VerificaBiometria';
import { cores, fontes, raio } from '../theme/theme';

function perguntarAcessoRapido() {
  return new Promise((resolve) => {
    Alert.alert(
      'Ativar acesso rápido por biometria?',
      'Nos próximos acessos, basta informar seu e-mail e usar a biometria do aparelho. Sua senha continua valendo.',
      [
        { text: 'Agora não', style: 'cancel', onPress: () => resolve(PREFERENCIA.RECUSADA) },
        { text: 'Ativar', onPress: () => resolve(PREFERENCIA.ATIVADA) },
      ],
      { cancelable: false }
    );
  });
}

// Pergunta uma única vez (aparelho com biometria e sem escolha anterior).
// Uma falha aqui nunca impede o login.
async function oferecerAcessoRapido(uid) {
  try {
    if (!(await deveOferecerBiometria(uid))) return;

    await salvarPreferencia(uid, await perguntarAcessoRapido());
  } catch (erro) {
    console.error('Erro ao salvar preferência de biometria:', erro);
  }
}

/*
 * sessaoRestaurada: sessão do Firebase guardada neste aparelho e
 * travada (biometria ativada). Se o e-mail digitado for o dela, a
 * biometria abre sozinha (VerificaBiometria) e destrava a sessão.
 */
export default function AutenticacaoScreen({ onAutenticado, sessaoRestaurada }) {
  const [tela, setTela] = useState(sessaoRestaurada ? 'login' : 'inicio');

  const senhaRef = useRef(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Somente no cadastro
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function continuar() {
    setErro('');
    setCarregando(true);

    try {
      if (tela === 'cadastro') {
        const erroCadastro = validarCadastro({
          nome,
          email,
          cpf,
          telefone,
          endereco,
          senha,
          confirmacao,
        });

        if (erroCadastro) {
          setErro(erroCadastro);
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

        // A senha fica só no Firebase Authentication.
        await salvarPerfilUsuario({
          ...usuario,
          cpf,
          telefone,
          endereco,
        });

        console.log('Conta criada:', usuario.uid);

        await oferecerAcessoRapido(usuario.uid);

        onAutenticado(usuario);
      } else {
        const resultado = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          senha
        );

        console.log('Login realizado:', resultado.user.uid);

        // Senha correta: zera as falhas de biometria deste usuário.
        await zerarFalhas(resultado.user.uid).catch(() => {});

        await oferecerAcessoRapido(resultado.user.uid);

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
      } else if (e.code === 'auth/too-many-requests') {
        setErro('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (e.code === 'auth/network-request-failed') {
        setErro('Sem conexão. Verifique sua internet e tente novamente.');
      } else {
        setErro('Não foi possível continuar. Tente novamente.');
      }
    }

    setCarregando(false);
  }

  // Biometria confirmada: entra com a sessão que o Firebase já guardava.
  function entrarPelaBiometria() {
    if (!auth.currentUser) {
      setErro('Sua sessão expirou. Digite sua senha para continuar.');
      senhaRef.current?.focus();
      return;
    }

    console.log('Login por biometria:', auth.currentUser.uid);

    onAutenticado(auth.currentUser);
  }

  async function esqueciSenha() {
    setErro('');

    if (!email.trim()) {
      setErro('Digite seu e-mail para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        'Verifique seu e-mail',
        'Se houver uma conta com este e-mail, enviamos um link para redefinir a senha.'
      );
    } catch (e) {
      if (e.code === 'auth/invalid-email') {
        setErro('Digite um e-mail válido.');
      } else {
        setErro('Não foi possível enviar o e-mail. Tente novamente.');
      }
    }
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
              Nome completo
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor={cores.textoSecundario}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              maxLength={60}
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
          onChangeText={(texto) => {
            setEmail(texto);
            setErro('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        {cadastro && (
          <>
            <Text style={styles.label}>
              CPF
            </Text>

            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor={cores.textoSecundario}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="number-pad"
              maxLength={14}
            />

            <Text style={styles.label}>
              Telefone
            </Text>

            <TextInput
              style={styles.input}
              placeholder="(21) 98765-4321"
              placeholderTextColor={cores.textoSecundario}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              maxLength={20}
            />

            <Text style={styles.label}>
              Endereço
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro, cidade - UF"
              placeholderTextColor={cores.textoSecundario}
              value={endereco}
              onChangeText={setEndereco}
              autoCapitalize="words"
              maxLength={120}
            />
          </>
        )}

        {!cadastro && (
          <VerificaBiometria
            email={email}
            sessao={sessaoRestaurada}
            onDesbloqueado={entrarPelaBiometria}
            onUsarSenha={() => senhaRef.current?.focus()}
          />
        )}

        <Text style={styles.label}>
          Senha
        </Text>

        <TextInput
          ref={senhaRef}
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor={cores.textoSecundario}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {cadastro && (
          <>
            <Text style={styles.label}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              placeholderTextColor={cores.textoSecundario}
              value={confirmacao}
              onChangeText={setConfirmacao}
              secureTextEntry
            />
          </>
        )}

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

        {!cadastro && (
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={esqueciSenha}
            disabled={carregando}
          >
            <Text style={styles.botaoVoltarTexto}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
        )}

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