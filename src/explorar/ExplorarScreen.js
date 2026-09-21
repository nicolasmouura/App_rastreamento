import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import {
  cores,
  fontes,
  raio,
  sombra,
} from '../theme/theme';

const DISTANCIA_DESBLOQUEIO = 200;

function calcularDistancia(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const raioTerra = 6371000;

  const diferencaLatitude =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const diferencaLongitude =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const latitude1Rad =
    (latitude1 * Math.PI) / 180;

  const latitude2Rad =
    (latitude2 * Math.PI) / 180;

  const a =
    Math.sin(diferencaLatitude / 2) *
      Math.sin(diferencaLatitude / 2) +
    Math.cos(latitude1Rad) *
      Math.cos(latitude2Rad) *
      Math.sin(diferencaLongitude / 2) *
      Math.sin(diferencaLongitude / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return raioTerra * c;
}

function formatarDistancia(distancia) {
  if (distancia < 1000) {
    return `${Math.round(distancia)} m`;
  }

  return `${(distancia / 1000).toFixed(1)} km`;
}

function criarPontosDeDemonstracao(location) {
  const {
    latitude,
    longitude,
  } = location;

  return [
    {
      id: '1',
      nome: 'Lugar para explorar',
      categoria: 'Turismo',
      latitude: latitude + 0.0012,
      longitude: longitude,
      icone: 'map-pin',
    },
    {
      id: '2',
      nome: 'Ponto histórico',
      categoria: 'História e cultura',
      latitude: latitude - 0.0015,
      longitude: longitude + 0.001,
      icone: 'flag',
    },
    {
      id: '3',
      nome: 'Área natural',
      categoria: 'Natureza',
      latitude: latitude + 0.0005,
      longitude: longitude - 0.0018,
      icone: 'sun',
    },
  ];
}

export default function ExplorarScreen({
  visitas = [],
  onRegistrarVisita,
}) {
  const [location, setLocation] =
    useState(null);

  const [pontos, setPontos] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState(null);

  const mapaRef =
    useRef(null);

  useEffect(() => {
    async function carregarLocalizacao() {
      try {
        setCarregando(true);
        setErro(null);

        const permissao =
          await Location.requestForegroundPermissionsAsync();

        if (
          permissao.status !== 'granted'
        ) {
          setErro(
            'Permissão de localização necessária para explorar lugares próximos.'
          );

          setCarregando(false);
          return;
        }

        const localizacao =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          });

        const coordenadas =
          localizacao.coords;

        setLocation(
          coordenadas
        );

        const novosPontos =
          criarPontosDeDemonstracao(
            coordenadas
          );

        setPontos(
          novosPontos
        );
      } catch (error) {
        console.error(
          'Erro ao carregar localização do Explorar:',
          error
        );

        setErro(
          'Não foi possível obter sua localização.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarLocalizacao();
  }, []);

  const centralizarNoUsuario = () => {
    if (
      !location ||
      !mapaRef.current
    ) {
      return;
    }

    mapaRef.current.animateCamera(
      {
        center: {
          latitude:
            location.latitude,
          longitude:
            location.longitude,
        },
        zoom: 16,
      },
      {
        duration: 700,
      }
    );
  };

  const quantidadeTrofeus =
    visitas.length;

  if (carregando) {
    return (
      <View
        style={
          styles.carregandoContainer
        }
      >
        <View
          style={
            styles.carregandoIcone
          }
        >
          <Feather
            name="compass"
            size={30}
            color={cores.primaria}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={cores.primaria}
          style={
            styles.carregandoIndicador
          }
        />

        <Text
          style={
            styles.carregandoTitulo
          }
        >
          Procurando lugares próximos...
        </Text>

        <Text
          style={
            styles.carregandoTexto
          }
        >
          Estamos usando sua localização para preparar o Explorar.
        </Text>
      </View>
    );
  }

  if (
    erro ||
    !location
  ) {
    return (
      <View
        style={
          styles.erroContainer
        }
      >
        <View
          style={
            styles.erroIcone
          }
        >
          <Feather
            name="map-pin"
            size={30}
            color={cores.erro}
          />
        </View>

        <Text
          style={
            styles.erroTitulo
          }
        >
          Localização indisponível
        </Text>

        <Text
          style={
            styles.erroTexto
          }
        >
          {erro ||
            'Não foi possível encontrar sua localização.'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.cabecalho}
      >
        <View
          style={styles.cabecalhoTopo}
        >
          <View
            style={
              styles.iconeCabecalho
            }
          >
            <Feather
              name="award"
              size={27}
              color={cores.primaria}
            />
          </View>

          <View
            style={styles.tituloArea}
          >
            <Text
              style={styles.titulo}
            >
              Explorar
            </Text>

            <Text
              style={
                styles.subtitulo
              }
            >
              Descubra lugares e conquiste troféus.
            </Text>
          </View>
        </View>
      </View>

      <View
        style={styles.mapaCard}
      >
        <MapView
          ref={mapaRef}
          style={styles.mapa}
          initialRegion={{
            latitude:
              location.latitude,
            longitude:
              location.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude:
                location.latitude,
              longitude:
                location.longitude,
            }}
            title="Você"
            description="Sua localização atual"
            anchor={{
              x: 0.5,
              y: 0.5,
            }}
          >
            <View
              style={
                styles.marcadorUsuario
              }
            >
              <View
                style={
                  styles.marcadorUsuarioInterno
                }
              />
            </View>
          </Marker>

          {pontos.map(
            (ponto) => {
              const visitado =
                visitas.some(
                  (visita) =>
                    visita.pontoId ===
                    ponto.id
                );

              return (
                <Marker
                  key={ponto.id}
                  coordinate={{
                    latitude:
                      ponto.latitude,
                    longitude:
                      ponto.longitude,
                  }}
                  title={
                    visitado
                      ? `${ponto.nome} ✓`
                      : ponto.nome
                  }
                  description={
                    visitado
                      ? 'Visita registrada'
                      : ponto.categoria
                  }
                >
                  <View
                    style={[
                      styles.marcadorPonto,
                      visitado &&
                        styles.marcadorPontoVisitado,
                    ]}
                  >
                    <Feather
                      name={
                        visitado
                          ? 'check'
                          : 'award'
                      }
                      size={18}
                      color={
                        cores.textoSobrePrimaria
                      }
                    />
                  </View>
                </Marker>
              );
            }
          )}
        </MapView>

        <View
          style={styles.legenda}
        >
          <View
            style={
              styles.legendaItem
            }
          >
            <View
              style={
                styles.legendaUsuario
              }
            />

            <Text
              style={
                styles.legendaTexto
              }
            >
              Você
            </Text>
          </View>

          <View
            style={
              styles.legendaItem
            }
          >
            <View
              style={
                styles.legendaPonto
              }
            >
              <Feather
                name="award"
                size={11}
                color={
                  cores.textoSobrePrimaria
                }
              />
            </View>

            <Text
              style={
                styles.legendaTexto
              }
            >
              Conquista
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={
            styles.botaoLocalizacao
          }
          onPress={
            centralizarNoUsuario
          }
          activeOpacity={0.8}
        >
          <Feather
            name="crosshair"
            size={21}
            color={cores.primaria}
          />
        </TouchableOpacity>
      </View>

      <View
        style={styles.conquistasCard}
      >
        <View
          style={styles.trofeu}
        >
          <Feather
            name="award"
            size={25}
            color={cores.primaria}
          />
        </View>

        <View
          style={
            styles.conquistasInfo
          }
        >
          <Text
            style={
              styles.conquistasTitulo
            }
          >
            Minhas conquistas
          </Text>

          <Text
            style={
              styles.conquistasTexto
            }
          >
            {quantidadeTrofeus === 1
              ? '1 troféu desbloqueado'
              : `${quantidadeTrofeus} troféus desbloqueados`}
          </Text>
        </View>

        <Feather
          name="chevron-right"
          size={20}
          color={
            cores.textoSecundario
          }
        />
      </View>

      <Text
        style={styles.secaoTitulo}
      >
        Lugares para descobrir
      </Text>

      <View
        style={styles.lista}
      >
        {pontos.map(
          (ponto) => {
            const distancia =
              calcularDistancia(
                location.latitude,
                location.longitude,
                ponto.latitude,
                ponto.longitude
              );

            const desbloqueado =
              distancia <=
              DISTANCIA_DESBLOQUEIO;

            const visitado =
              visitas.some(
                (visita) =>
                  visita.pontoId ===
                  ponto.id
              );

            return (
              <View
                key={ponto.id}
                style={
                  styles.pontoCard
                }
              >
                <View
                  style={
                    styles.pontoIcone
                  }
                >
                  <Feather
                    name={
                      visitado
                        ? 'check'
                        : ponto.icone
                    }
                    size={22}
                    color={
                      cores.primaria
                    }
                  />
                </View>

                <View
                  style={
                    styles.pontoInfo
                  }
                >
                  <Text
                    style={
                      styles.pontoNome
                    }
                  >
                    {ponto.nome}
                  </Text>

                  <Text
                    style={
                      styles.pontoCategoria
                    }
                  >
                    {visitado
                      ? 'Visita registrada'
                      : ponto.categoria}
                  </Text>

                  <Text
                    style={
                      styles.pontoDistancia
                    }
                  >
                    {formatarDistancia(
                      distancia
                    )}
                  </Text>
                </View>

                {visitado ? (
                  <View
                    style={
                      styles.visitado
                    }
                  >
                    <Feather
                      name="check-circle"
                      size={18}
                      color={
                        cores.online
                      }
                    />
                  </View>
                ) : desbloqueado ? (
                  <TouchableOpacity
                    style={
                      styles.botaoRegistrar
                    }
                    activeOpacity={0.8}
                    onPress={() => {
                      if (
                        onRegistrarVisita
                      ) {
                        onRegistrarVisita(
                          ponto
                        );
                      }
                    }}
                  >
                    <Feather
                      name="camera"
                      size={16}
                      color={
                        cores.textoSobrePrimaria
                      }
                    />

                    <Text
                      style={
                        styles.botaoRegistrarTexto
                      }
                    >
                      Registrar
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={
                      styles.bloqueado
                    }
                  >
                    <Feather
                      name="lock"
                      size={16}
                      color={
                        cores.textoSecundario
                      }
                    />
                  </View>
                )}
              </View>
            );
          }
        )}
      </View>

      <View
        style={styles.infoCard}
      >
        <Feather
          name="compass"
          size={22}
          color={cores.primaria}
        />

        <Text
          style={styles.infoTexto}
        >
          Aproxime-se de um lugar para desbloquear o registro
          da sua visita.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      cores.fundo,
    paddingHorizontal: 20,
    paddingTop: 48,
  },

  cabecalho: {
    marginBottom: 14,
  },

  cabecalhoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeCabecalho: {
    width: 48,
    height: 48,
    borderRadius:
      raio.card,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloArea: {
    flex: 1,
    marginLeft: 13,
  },

  titulo: {
    fontSize: 27,
    color: cores.texto,
    fontFamily:
      fontes.titulo,
  },

  subtitulo: {
    marginTop: 2,
    fontSize: 13,
    color:
      cores.textoSecundario,
  },

  mapaCard: {
    height: 285,
    borderRadius:
      raio.card,
    overflow: 'hidden',
    marginBottom: 14,
    ...sombra,
  },

  mapa: {
    flex: 1,
  },

  marcadorUsuario: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      'rgba(7, 84, 217, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor:
      cores.superficie,
  },

  marcadorUsuarioInterno: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      cores.primaria,
  },

  marcadorPonto: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor:
      cores.superficie,
    ...sombra,
  },

  marcadorPontoVisitado: {
    backgroundColor:
      cores.online,
  },

  legenda: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 13,
  },

  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendaUsuario: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor:
      cores.primaria,
    marginRight: 5,
  },

  legendaPonto: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor:
      cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },

  legendaTexto: {
    fontSize: 11,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
  },

  botaoLocalizacao: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },

  conquistasCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      cores.superficie,
    borderRadius:
      raio.card,
    padding: 13,
    marginBottom: 14,
    ...sombra,
  },

  trofeu: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  conquistasInfo: {
    flex: 1,
    marginLeft: 13,
  },

  conquistasTitulo: {
    fontSize: 15,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
  },

  conquistasTexto: {
    marginTop: 3,
    fontSize: 12,
    color:
      cores.textoSecundario,
  },

  secaoTitulo: {
    fontSize: 18,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
    marginBottom: 9,
  },

  lista: {
    gap: 9,
  },

  pontoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      cores.superficie,
    borderRadius:
      raio.card,
    padding: 12,
    ...sombra,
  },

  pontoIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pontoInfo: {
    flex: 1,
    marginLeft: 11,
  },

  pontoNome: {
    fontSize: 14,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
  },

  pontoCategoria: {
    marginTop: 2,
    fontSize: 11,
    color:
      cores.textoSecundario,
  },

  pontoDistancia: {
    marginTop: 3,
    fontSize: 12,
    color: cores.primaria,
    fontFamily:
      fontes.destaque,
  },

  bloqueado: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  visitado: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoRegistrar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      cores.primaria,
    borderRadius:
      raio.botaoSecundario,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  botaoRegistrarTexto: {
    marginLeft: 5,
    fontSize: 11,
    color:
      cores.textoSobrePrimaria,
    fontFamily:
      fontes.destaque,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      cores.superficieAlternativa,
    borderRadius:
      raio.card,
    padding: 12,
    marginTop: 14,
    marginBottom: 15,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 11,
    fontSize: 12,
    lineHeight: 18,
    color:
      cores.textoSecundario,
  },

  carregandoContainer: {
    flex: 1,
    backgroundColor:
      cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  carregandoIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor:
      cores.superficieAlternativa,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carregandoIndicador: {
    marginTop: 18,
  },

  carregandoTitulo: {
    marginTop: 14,
    fontSize: 18,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
    textAlign: 'center',
  },

  carregandoTexto: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color:
      cores.textoSecundario,
    textAlign: 'center',
  },

  erroContainer: {
    flex: 1,
    backgroundColor:
      cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  erroIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor:
      cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },

  erroTitulo: {
    marginTop: 16,
    fontSize: 19,
    color: cores.texto,
    fontFamily:
      fontes.destaque,
    textAlign: 'center',
  },

  erroTexto: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color:
      cores.textoSecundario,
    textAlign: 'center',
  },
});