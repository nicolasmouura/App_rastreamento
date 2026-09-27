import { StyleSheet, Text, View } from 'react-native';
import { cores, fontes, raio, sombra } from '../theme/theme';

const STATUS = {
  ativo: { texto: 'Membro ativo', cor: cores.online },
  pendente: { texto: 'Convite pendente', cor: cores.pendente },
};

export default function MembroCard({ nome, status, administrador, voce }) {
  const infoStatus = STATUS[status] || STATUS.pendente;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.nomeLinha}>
          <Text style={styles.nome} numberOfLines={1}>
            {nome}
            {voce ? ' (você)' : ''}
          </Text>

          {administrador && (
            <Text style={styles.administrador}>Administrador</Text>
          )}
        </View>

        <View style={styles.statusLinha}>
          <View
            style={[styles.bolinha, { backgroundColor: infoStatus.cor }]}
          />

          <Text style={styles.statusTexto}>{infoStatus.texto}</Text>
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

  nomeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  nome: {
    flexShrink: 1,
    fontSize: 17,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  administrador: {
    fontSize: 12,
    fontFamily: fontes.destaque,
    color: cores.primaria,
    backgroundColor: cores.superficieAlternativa,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: raio.pilula,
    overflow: 'hidden',
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
