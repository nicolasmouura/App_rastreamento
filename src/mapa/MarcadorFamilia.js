import { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';
import { cores, fontes } from '../theme/theme';

export default function MarcadorFamilia({ membro }) {
  return (
    <Marker
      coordinate={{
        latitude: membro.latitude,
        longitude: membro.longitude,
      }}
      title={membro.nome || 'Familiar'}
      description={
        membro.online
          ? `${membro.parentesco} • Localização ativa`
          : `${membro.parentesco} • Localização desativada`
      }
    >
      <View style={styles.container}>
        <View style={styles.marcador}>
          <Text style={styles.inicial}>
            {(membro.nome || '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nomeContainer}>
          <Text style={styles.nome}>
            {membro.nome || 'Familiar'}
          </Text>

          <View style={styles.statusLinha}>
            <View
              style={[
                styles.bolinha,
                { backgroundColor: membro.online ? cores.online : cores.offline },
              ]}
            />
            <Text style={styles.status}>
              {membro.online ? 'Online' : 'Offline'}
            </Text>
          </View>
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

  inicial: {
    color: cores.textoSobrePrimaria,
    fontSize: 20,
    fontFamily: fontes.titulo,
  },

  nomeContainer: {
    marginTop: 4,
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

  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  bolinha: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  status: {
    fontSize: 10,
    color: cores.textoSecundario,
  },
});