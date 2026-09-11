import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <Text style={styles.icone}>👤</Text>
        )}
      </View>

      <TouchableOpacity onPress={onAlterarFoto}>
        <Text style={styles.alterarFoto}>
          📷 Alterar foto
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
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  imagem: {
    width: '100%',
    height: '100%',
  },

  icone: {
    fontSize: 45,
  },

  alterarFoto: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },

  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },

  email: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 5,
  },
});