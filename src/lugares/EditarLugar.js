import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

import {
  buscarCoordenadas,
  buscarEndereco,
  formatarEnderecoCompleto,
} from '../dados/enderecos';
import { cores, fontes, raio } from '../theme/theme';

const ZOOM_LUGAR = { latitudeDelta: 0.004, longitudeDelta: 0.004 };

/*
 * Cadastrar/editar um lugar (Casa): mapa com alfinete arrastável,
 * busca de endereço e endereço editável. Tudo com expo-location
 * (já instalado) e react-native-maps.
 */
export default function EditarLugar({ tipo, lugar, posicaoAtual, onFechar, onSalvar }) {
  const mapaRef = useRef(null);

  const inicial = lugar
    ? { latitude: lugar.latitude, longitude: lugar.longitude }
    : posicaoAtual
    ? { latitude: posicaoAtual.latitude, longitude: posicaoAtual.longitude }
    : null;

  const [pino, setPino] = useState(inicial);
  const [endereco, setEndereco] = useState(lugar?.endereco || '');
  const [busca, setBusca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  async function preencherEndereco(coordenadas) {
    const resultado = await buscarEndereco(coordenadas);
    const texto = formatarEnderecoCompleto(resultado);

    if (texto) setEndereco(texto);
  }

  // Novo lugar a partir da minha posição: sugere o endereço.
  useEffect(() => {
    if (!lugar && pino) preencherEndereco(pino);
  }, []);

  function moverPino(coordenadas) {
    setPino(coordenadas);
    setErro('');
    preencherEndereco(coordenadas);
  }

  function centralizar(coordenadas) {
    mapaRef.current?.animateToRegion({ ...coordenadas, ...ZOOM_LUGAR }, 600);
  }

  async function pesquisar() {
    if (!busca.trim()) return;

    setOcupado(true);
    setErro('');

    const encontrado = await buscarCoordenadas(busca);

    setOcupado(false);

    if (!encontrado) {
      setErro('Endereço não encontrado. Tente com rua, número e cidade.');
      return;
    }

    setPino(encontrado);
    setEndereco(busca.trim());
    centralizar(encontrado);
  }

  function usarMinhaLocalizacao() {
    if (!posicaoAtual) {
      setErro('Sua localização atual não está disponível.');
      return;
    }

    const coordenadas = { latitude: posicaoAtual.latitude, longitude: posicaoAtual.longitude };

    moverPino(coordenadas);
    centralizar(coordenadas);
  }

  async function salvar() {
    if (!pino) {
      setErro('Marque no mapa onde fica o lugar.');
      return;
    }

    if (!endereco.trim()) {
      setErro('Informe o endereço.');
      return;
    }

    try {
      setOcupado(true);
      setErro('');
      await onSalvar({ endereco, latitude: pino.latitude, longitude: pino.longitude });
    } catch (e) {
      console.log('Lugar não salvo:', e.code || e.message);
      setErro('Não foi possível salvar. Tente novamente.');
      setOcupado(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topo}>
          <TouchableOpacity onPress={onFechar} disabled={ocupado} style={styles.fechar}>
            <Feather name="x" size={22} color={cores.texto} />
          </TouchableOpacity>

          <Text style={styles.titulo}>{lugar ? `Editar ${tipo.nome}` : `Cadastrar ${tipo.nome}`}</Text>
        </View>

        <View style={styles.busca}>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar endereço (rua, número, cidade)"
            placeholderTextColor={cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={pesquisar}
            returnKeyType="search"
          />

          <TouchableOpacity style={styles.buscaBotao} onPress={pesquisar} disabled={ocupado}>
            <Feather name="search" size={18} color={cores.textoSobrePrimaria} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapaArea}>
          <MapView
            ref={mapaRef}
            style={styles.mapa}
            initialRegion={inicial ? { ...inicial, ...ZOOM_LUGAR } : undefined}
            onPress={(evento) => moverPino(evento.nativeEvent.coordinate)}
          >
            {pino && (
              <Marker
                coordinate={pino}
                draggable
                onDragEnd={(evento) => moverPino(evento.nativeEvent.coordinate)}
                pinColor={cores.primaria}
              />
            )}
          </MapView>

          <TouchableOpacity style={styles.minhaPosicao} onPress={usarMinhaLocalizacao}>
            <Feather name="crosshair" size={16} color={cores.primaria} />
            <Text style={styles.minhaPosicaoTexto}>Usar minha localização</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rodape}>
          <Text style={styles.dica}>
            Toque no mapa ou arraste o alfinete até a {tipo.nome.toLowerCase()}.
          </Text>

          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={styles.input}
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Rua, número, bairro, cidade"
            placeholderTextColor={cores.textoSecundario}
            maxLength={200}
          />

          <Text style={styles.privacidade}>
            O endereço e a posição são privados. Sua família vê apenas
            "Em casa" ou a distância aproximada até a casa.
          </Text>

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.botao, ocupado && styles.botaoDesabilitado]}
            onPress={salvar}
            disabled={ocupado}
          >
            {ocupado ? (
              <ActivityIndicator color={cores.textoSobrePrimaria} />
            ) : (
              <Text style={styles.botaoTexto}>Salvar {tipo.nome.toLowerCase()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  fechar: {
    padding: 4,
  },

  titulo: {
    fontSize: 20,
    fontFamily: fontes.titulo,
    color: cores.texto,
  },

  busca: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  buscaInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.botaoSecundario + 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: cores.superficie,
    color: cores.texto,
  },

  buscaBotao: {
    width: 46,
    borderRadius: raio.botaoSecundario + 4,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapaArea: {
    flex: 1,
  },

  mapa: {
    flex: 1,
  },

  minhaPosicao: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: raio.pilula,
    backgroundColor: cores.superficie,
  },

  minhaPosicaoTexto: {
    fontSize: 13,
    fontFamily: fontes.destaque,
    color: cores.primaria,
  },

  rodape: {
    padding: 16,
    gap: 6,
  },

  dica: {
    fontSize: 12,
    color: cores.textoSecundario,
  },

  label: {
    fontSize: 14,
    fontFamily: fontes.destaque,
    color: cores.texto,
    marginTop: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.botaoSecundario + 4,
    padding: 12,
    fontSize: 15,
    backgroundColor: cores.superficie,
    color: cores.texto,
  },

  privacidade: {
    fontSize: 12,
    color: cores.textoSecundario,
  },

  erro: {
    color: cores.erro,
    textAlign: 'center',
  },

  botao: {
    marginTop: 6,
    padding: 15,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },
});
