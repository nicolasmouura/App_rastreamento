import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { cores, fontes, raio, sombra } from '../theme/theme';

export default function ConquistaScreen({
  visita,
  onContinuar,
}) {
  if (!visita) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        <View style={styles.trofeu}>
          <Feather
            name="award"
            size={58}
            color={cores.primaria}
          />
        </View>

        <Text style={styles.titulo}>
          Troféu desbloqueado!
        </Text>

        <Text style={styles.subtitulo}>
          Você registrou uma nova conquista no Conecta.
        </Text>

        <View style={styles.card}>
          <View style={styles.iconeLugar}>
            <Feather
              name="map-pin"
              size={25}
              color={cores.primaria}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>
              Lugar explorado
            </Text>

            <Text style={styles.nomeLugar}>
              {visita.nome}
            </Text>

            <Text style={styles.categoria}>
              {visita.categoria}
            </Text>
          </View>

          <View style={styles.check}>
            <Feather
              name="check"
              size={18}
              color={cores.online}
            />
          </View>
        </View>

        <View style={styles.mensagem}>
          <Feather
            name="star"
            size={20}
            color={cores.primaria}
          />

          <Text style={styles.mensagemTexto}>
            Essa conquista agora faz parte das suas
            explorações.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botao}
          activeOpacity={0.85}
          onPress={onContinuar}
        >
          <Text style={styles.botaoTexto}>
            Continuar explorando
          </Text>

          <Feather
            name="arrow-right"
            size={20}
            color={cores.textoSobrePrimaria}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  trofeu: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...sombra,
  },

  titulo: {
    fontSize: 28,
    fontFamily: fontes.titulo,
    color: cores.texto,
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 15,
    lineHeight: 22,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    maxWidth: 320,
  },

  card: {
    width: '100%',
    backgroundColor: cores.superficie,
    borderRadius: raio.card,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...sombra,
  },

  iconeLugar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  info: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 3,
  },

  nomeLugar: {
    fontSize: 16,
    fontFamily: fontes.destaque,
    color: cores.texto,
  },

  categoria: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  mensagem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  mensagemTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: cores.textoSecundario,
    marginLeft: 9,
  },

  botao: {
    width: '100%',
    minHeight: 54,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 15,
    fontFamily: fontes.destaque,
    marginRight: 8,
  },
});