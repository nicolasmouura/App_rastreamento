import { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';
import { cores, fontes } from '../theme/theme';

// membro: item gerado por montarMarcadores (src/dados/buscarFamiliares.js)
export default function MarcadorFamilia({ membro }) {
  const titulo = membro.voce ? `${membro.nome} (você)` : membro.nome;

  return (
    <Marker
      coordinate={{
        latitude: membro.latitude,
        longitude: membro.longitude,
      }}
      title={titulo}
      description={`${membro.situacao} · ${membro.detalhe}`}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.marcador,
            !membro.recente && styles.marcadorAntigo,
            membro.voce && styles.marcadorVoce,
          ]}
        >
          <Text style={styles.inicial}>
            {membro.nome.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nomeContainer}>
          <Text style={styles.nome} numberOfLines={1}>
            {membro.voce ? 'Você' : membro.nome}
          </Text>

          <Text style={styles.status} numberOfLines={1}>
            {membro.detalhe}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  marcador: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: cores.superficie,
  },

  // Localização com mais de 10 min: cor neutra.
  marcadorAntigo: {
    backgroundColor: cores.textoSecundario,
  },

  marcadorVoce: {
    borderColor: cores.online,
  },

  inicial: {
    color: cores.textoSobrePrimaria,
    fontSize: 20,
    fontFamily: fontes.titulo,
  },

  nomeContainer: {
    marginTop: 4,
    maxWidth: 140,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: cores.superficie,
    alignItems: 'center',
  },

  nome: {
    fontSize: 13,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  status: {
    fontSize: 10,
    color: cores.textoSecundario,
  },
});
