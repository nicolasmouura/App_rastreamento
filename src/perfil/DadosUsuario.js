import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cores, fontes } from '../theme/theme';

export default function DadosUsuario({ usuario, foto, onAlterarFoto }) {
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
        {usuario?.nome || 'Usuário'}
      </Text>

      <Text style={styles.email}>
        {usuario?.email || ''}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '90%',
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
    marginTop: 20,
  },

  email: {
    fontSize: 15,
    color: cores.textoSecundario,
    marginTop: 5,
  },
});