import { useState } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  criarGrupo,
  procurarGrupoPorCodigo,
  solicitarEntrada,
} from '../dados/grupo';

import { salvarGrupoNoUsuario } from '../dados/salvarUsuario';

export default function GrupoScreen({
  usuario,
  onGrupoConcluido,
}) {
  const [criando, setCriando] = useState(false);
  const [entrando, setEntrando] = useState(false);

  const [nomeGrupo, setNomeGrupo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [grupoCriado, setGrupoCriado] = useState(null);

  // =====================================================
  // ENTRAR COM CÓDIGO
  // =====================================================

  if (entrando) {
    return (
      <View style={styles.container}>

        <Text style={styles.titulo}>
          Entrar em grupo familiar
        </Text>

        <Text style={styles.subtitulo}>
          Digite o código de convite recebido
          de um administrador da família.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: TSG9FW"
          value={codigoConvite}
          onChangeText={(texto) => {
            setCodigoConvite(
              texto.toUpperCase()
            );
            setErro('');
          }}
          autoCapitalize="characters"
          maxLength={6}
        />

        {erro ? (
          <Text style={styles.erro}>
            {erro}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.botao}
          disabled={carregando}
          onPress={async () => {

            const codigo =
              codigoConvite.trim().toUpperCase();

            if (codigo.length !== 6) {
              setErro(
                'Digite um código de 6 caracteres.'
              );
              return;
            }

            try {
              setErro('');
              setCarregando(true);

              // Procura o grupo pelo código
              const grupo =
                await procurarGrupoPorCodigo(
                  codigo
                );

              if (!grupo) {
                setErro(
                  'Código de convite inválido.'
                );
                return;
              }

              console.log(
                'Grupo encontrado:',
                grupo.id
              );

              console.log(
                'Nome do grupo:',
                grupo.nome
              );

              // Cria a solicitação de entrada
              await solicitarEntrada(
                grupo.id,
                usuario
              );

              setErro('');

              console.log(
                'Solicitação enviada para o administrador.'
              );

              alert(
                'Solicitação enviada! Aguarde o administrador aceitar sua entrada.'
              );

              setCodigoConvite('');
              setEntrando(false);

            } catch (e) {

              console.error(
                'Erro ao solicitar entrada:',
                e
              );

              if (
                e.message ===
                'SOLICITACAO_JA_EXISTE'
              ) {
                setErro(
                  'Você já solicitou entrada nesse grupo.'
                );
              } else {
                setErro(
                  'Não foi possível solicitar entrada.'
                );
              }

            } finally {
              setCarregando(false);
            }
          }}
        >
          <Text style={styles.botaoTexto}>
            {carregando
              ? 'Verificando...'
              : 'Solicitar entrada'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => {
            setEntrando(false);
            setCodigoConvite('');
            setErro('');
          }}
        >
          <Text style={styles.botaoSecundarioTexto}>
            Voltar
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // =====================================================
  // GRUPO CRIADO
  // =====================================================

  if (grupoCriado) {
    return (
      <View style={styles.container}>

        <Text style={styles.titulo}>
          🎉 Grupo criado!
        </Text>

        <Text style={styles.subtitulo}>
          {grupoCriado.nome}
        </Text>

        <Text style={styles.label}>
          Código de convite
        </Text>

        <Text style={styles.codigo}>
          {grupoCriado.codigoConvite}
        </Text>

        <Text style={styles.instrucao}>
          Compartilhe este código com sua família
          para que eles possam solicitar entrada
          no grupo.
        </Text>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => onGrupoConcluido(grupoCriado.id)}
        >
          <Text style={styles.botaoTexto}>
            Continuar
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // =====================================================
  // CRIAR GRUPO
  // =====================================================

  if (criando) {
    return (
      <View style={styles.container}>

        <Text style={styles.titulo}>
          Criar grupo familiar
        </Text>

        <Text style={styles.subtitulo}>
          Escolha um nome para identificar sua família.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Família Talys"
          value={nomeGrupo}
          onChangeText={(texto) => {
            setNomeGrupo(texto);
            setErro('');
          }}
        />

        {erro ? (
          <Text style={styles.erro}>
            {erro}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.botao}
          disabled={carregando}
          onPress={async () => {

            if (!nomeGrupo.trim()) {
              setErro(
                'Digite um nome para o grupo.'
              );
              return;
            }

            try {
              setErro('');
              setCarregando(true);

              // Cria o grupo no Firebase
              const grupo =
                await criarGrupo(
                  nomeGrupo,
                  usuario
                );

              // Salva o grupo no perfil do usuário
              await salvarGrupoNoUsuario(
                usuario.uid,
                grupo.id
              );

              console.log(
                'Grupo vinculado ao usuário.'
              );

              setGrupoCriado(grupo);

            } catch (e) {

              console.error(
                'Erro ao criar grupo:',
                e
              );

              setErro(
                'Não foi possível criar o grupo.'
              );

            } finally {
              setCarregando(false);
            }
          }}
        >
          <Text style={styles.botaoTexto}>
            {carregando
              ? 'Criando...'
              : 'Criar grupo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => {
            setCriando(false);
            setErro('');
          }}
        >
          <Text style={styles.botaoSecundarioTexto}>
            Voltar
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // =====================================================
  // TELA PRINCIPAL
  // =====================================================

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Grupo Familiar
      </Text>

      <Text style={styles.subtitulo}>
        Você ainda não faz parte de um grupo familiar.
      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => {
          setCriando(true);
          setErro('');
        }}
      >
        <Text style={styles.botaoTexto}>
          Criar grupo familiar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => {
          setEntrando(true);
          setErro('');
        }}
      >
        <Text style={styles.botaoSecundarioTexto}>
          Entrar com código de convite
        </Text>
      </TouchableOpacity>

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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitulo: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 30,
    lineHeight: 21,
  },

  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  botao: {
    width: '90%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    marginBottom: 12,
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  botaoSecundario: {
    width: '90%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
    marginBottom: 12,
  },

  botaoSecundarioTexto: {
    color: '#2563eb',
    fontSize: 17,
    fontWeight: 'bold',
  },

  erro: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },

  codigo: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 15,
  },

  instrucao: {
    width: '90%',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 30,
    lineHeight: 21,
  },

});