import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { mascararDocumento } from '../dados/salvarUsuario';
import { cores, fontes, raio } from '../theme/theme';

function Informacao({ icone, label, valor }) {
  return (
    <View style={styles.linha}>
      <Feather name={icone} size={17} color={cores.primaria} />

      <View style={styles.linhaTextos}>
        <Text style={styles.linhaLabel}>{label}</Text>
        <Text style={styles.linhaValor}>{valor || 'Não informado'}</Text>
      </View>
    </View>
  );
}

// Foto + dados pessoais do usuário ("Meu Perfil"). A edição fica em
// Configurações → Editar informações.
export default function DadosUsuario({ perfil, foto, onAlterarFoto }) {
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

      <Text style={styles.nome}>
        {perfil.nome || 'Usuário'}
      </Text>

      <View style={styles.cartao}>
        <Informacao icone="mail" label="E-mail" valor={perfil.email} />
        <Informacao
          icone="credit-card"
          label="CPF"
          valor={perfil.documento ? mascararDocumento(perfil.documento) : ''}
        />
        <Informacao icone="phone" label="Telefone" valor={perfil.telefone} />
        <Informacao icone="home" label="Endereço" valor={perfil.endereco} />
      </View>

      <Text style={styles.dica}>
        Para alterar seus dados, vá em Configurações → Editar informações.
      </Text>

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

  nome: {
    fontSize: 22,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },

  cartao: {
    width: '100%',
    padding: 16,
    gap: 14,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  linhaTextos: {
    flex: 1,
  },

  linhaLabel: {
    fontSize: 12,
    color: cores.textoSecundario,
  },

  linhaValor: {
    fontSize: 15,
    color: cores.texto,
  },

  dica: {
    fontSize: 12,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 10,
  },
});
