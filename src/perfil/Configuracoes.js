import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cores, fontes } from '../theme/theme';

const ITENS = [
  { chave: 'notificacoes', label: 'Notificações', icone: 'bell' },
  { chave: 'localizacao', label: 'Localização', icone: 'map-pin' },
  { chave: 'seguranca', label: 'Segurança', icone: 'lock' },
];

export default function Configuracoes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      {ITENS.map((item) => (
        <TouchableOpacity key={item.chave} style={styles.item}>
          <View style={styles.itemEsquerda}>
            <Feather name={item.icone} size={18} color={cores.textoSecundario} />
            <Text style={styles.itemText}>{item.label}</Text>
          </View>

          <Feather name="chevron-right" size={18} color={cores.textoSecundario} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 30,
  },

  title: {
    fontSize: 17,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginBottom: 10,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  itemEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  itemText: {
    fontSize: 16,
    color: cores.texto,
  },
});