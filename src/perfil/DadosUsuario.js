import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { LIMITES_PERFIL, validarPerfil } from '../dados/salvarUsuario';
import { cores, fontes, raio } from '../theme/theme';

const CAMPOS = [
  {
    chave: 'nome',
    label: 'Nome',
    placeholder: 'Seu nome',
    autoCapitalize: 'words',
  },
  {
    chave: 'telefone',
    label: 'Telefone',
    placeholder: '(21) 98765-4321',
    keyboardType: 'phone-pad',
  },
  {
    chave: 'documento',
    label: 'Documento',
    placeholder: 'CPF ou RG',
    autoCapitalize: 'characters',
  },
  {
    chave: 'endereco',
    label: 'Onde mora (opcional)',
    placeholder: 'Ex: Engenheiro Paulo de Frontin - RJ',
    autoCapitalize: 'words',
  },
];

// Foto + dados pessoais editáveis do usuário ("Meu Perfil").
export default function DadosUsuario({ perfil, foto, onAlterarFoto, onSalvar }) {
  const [dados, setDados] = useState({
    nome: perfil.nome,
    telefone: perfil.telefone,
    documento: perfil.documento,
    endereco: perfil.endereco,
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function alterarCampo(chave, valor) {
    setDados((atuais) => ({ ...atuais, [chave]: valor }));
    setErro('');
    setSucesso('');
  }

  async function salvar() {
    const mensagemErro = validarPerfil(dados);

    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    try {
      setErro('');
      setSucesso('');
      setSalvando(true);

      const salvos = await onSalvar(dados);

      setDados(salvos);
      setSucesso('Dados atualizados com sucesso.');
    } catch (e) {
      console.error('Erro ao atualizar perfil:', e);
      setErro('Não foi possível atualizar seus dados.\nTente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.foto}>
        {foto ? (
          <Image
            source={{ uri: foto }}
            style={styles.imagem}
          />
        ) : (
          <Feather name="user" size={44} color={cores.textoSecundario} />
        )}
      </View>

      <TouchableOpacity style={styles.alterarFotoBotao} onPress={onAlterarFoto}>
        <Feather name="camera" size={15} color={cores.primaria} />
        <Text style={styles.alterarFoto}>
          Alterar foto
        </Text>
      </TouchableOpacity>

      <View style={styles.formulario}>
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.email}>{perfil.email || '—'}</Text>

        {CAMPOS.map((campo) => (
          <View key={campo.chave}>
            <Text style={styles.label}>{campo.label}</Text>

            <TextInput
              style={styles.input}
              value={dados[campo.chave]}
              onChangeText={(valor) => alterarCampo(campo.chave, valor)}
              placeholder={campo.placeholder}
              placeholderTextColor={cores.textoSecundario}
              keyboardType={campo.keyboardType}
              autoCapitalize={campo.autoCapitalize}
              autoCorrect={false}
              maxLength={LIMITES_PERFIL[campo.chave]}
              editable={!salvando}
            />
          </View>
        ))}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        {sucesso ? <Text style={styles.sucesso}>✓ {sucesso}</Text> : null}

        <TouchableOpacity
          style={[styles.botao, salvando && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.botaoTexto}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },

  foto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  imagem: {
    width: '100%',
    height: '100%',
  },

  alterarFotoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },

  alterarFoto: {
    color: cores.primaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  formulario: {
    width: '100%',
    marginTop: 22,
  },

  label: {
    fontSize: 14,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 6,
  },

  email: {
    fontSize: 16,
    color: cores.textoSecundario,
    marginBottom: 16,
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
  },

  sucesso: {
    color: cores.online,
    fontFamily: fontes.destaque,
    textAlign: 'center',
    marginBottom: 12,
  },

  botao: {
    width: '100%',
    padding: 16,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },
});
