import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { cores, fontes, raio, sombra } from '../src/theme/theme';

const OPCOES = [
  { chave: 'mapa', label: 'Mapa', icone: 'map-pin' },
  { chave: 'familia', label: 'Minha Família', icone: 'users' },
  { chave: 'camera', label: 'Câmera', icone: 'camera' },
  { chave: 'perfil', label: 'Meu Perfil', icone: 'user' },
];

export default function Menu({ onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busca Familiar</Text>

      <Text style={styles.subtitle}>
        O que você deseja acessar?
      </Text>

      <View style={styles.grid}>
        {OPCOES.map((opcao) => (
          <TouchableOpacity
            key={opcao.chave}
            style={styles.card}
            onPress={() => onSelect(opcao.chave)}
          >
            <View style={styles.iconeContainer}>
              <Feather name={opcao.icone} size={26} color={cores.primaria} />
            </View>

            <Text style={styles.cardLabel}>{opcao.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: cores.fundo,
  },

  title: {
    fontSize: 28,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: cores.textoSecundario,
    marginBottom: 30,
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '47%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: raio.card,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },

  iconeContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  cardLabel: {
    fontSize: 15,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },
});