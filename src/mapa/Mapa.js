import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import MapView from 'react-native-maps';

import MarcadorFamilia from './MarcadorFamilia';

const MARGEM_ENQUADRAMENTO = { top: 120, right: 60, bottom: 180, left: 60 };

// marcadores: um item por pessoa (montarMarcadores), já validados.
// pronto: dados iniciais da família carregados.
export default function Mapa({ marcadores, pronto }) {
  const mapaRef = useRef(null);
  const mapaPronto = useRef(false);

  // Depois que o usuário mexe no mapa, não reenquadramos mais.
  const usuarioMoveu = useRef(false);
  const ultimoEnquadramento = useRef('');

  // Muda só quando alguém aparece ou some do mapa,
  // não a cada movimento de um membro.
  const pessoasVisiveis = marcadores
    .map((marcador) => marcador.uid)
    .sort()
    .join(',');

  function enquadrar() {
    if (
      !mapaRef.current ||
      !mapaPronto.current ||
      !pronto ||
      usuarioMoveu.current ||
      !pessoasVisiveis ||
      ultimoEnquadramento.current === pessoasVisiveis
    ) {
      return;
    }

    ultimoEnquadramento.current = pessoasVisiveis;

    const coordenadas = marcadores.map(({ latitude, longitude }) => ({
      latitude,
      longitude,
    }));

    // Pequeno intervalo para o mapa aparecer antes da animação.
    setTimeout(() => {
      if (!mapaRef.current) return;

      if (coordenadas.length === 1) {
        mapaRef.current.animateCamera(
          { center: coordenadas[0], zoom: 16, pitch: 0, heading: 0 },
          { duration: 1000 }
        );
      } else {
        mapaRef.current.fitToCoordinates(coordenadas, {
          edgePadding: MARGEM_ENQUADRAMENTO,
          animated: true,
        });
      }
    }, 300);
  }

  useEffect(() => {
    enquadrar();
  }, [pronto, pessoasVisiveis]);

  return (
    <MapView
      ref={mapaRef}
      style={styles.map}
      onMapReady={() => {
        mapaPronto.current = true;
        enquadrar();
      }}
      onPanDrag={() => {
        usuarioMoveu.current = true;
      }}
    >
      {marcadores.map((marcador) => (
        <MarcadorFamilia
          key={marcador.uid}
          membro={marcador}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
