import { StyleSheet, Text, View } from 'react-native';
import { cores, fontes, raio, sombra } from '../theme/theme';

export default function MembroCard({ nome, status }) {
  const online = status === 'online';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>

        <View style={styles.statusLinha}>
          <View
            style={[
              styles.bolinha,
              { backgroundColor: online ? cores.online : cores.offline },
            ]}
          />

          <Text style={styles.statusTexto}>
            {online ? 'Localização ativa' : 'Localização desativada'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    padding: 16,
    marginVertical: 6,
    borderRadius: raio.card,
    backgroundColor: cores.superficie,
    ...sombra,
  },

  info: {
    gap: 6,
  },

  nome: {
    fontSize: 17,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  bolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
  },
});