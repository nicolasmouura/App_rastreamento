import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Política de envio: economiza bateria, internet e gravações.
export const INTERVALO_MINIMO_ENVIO = 15 * 1000; // nunca mais que 1 gravação a cada 15 s
export const INTERVALO_MAXIMO_ENVIO = 5 * 60 * 1000; // parado: 1 gravação a cada 5 min
export const DISTANCIA_MINIMA_ENVIO = 50; // em movimento: a cada 50 m

export function observarFamiliares(grupoId, callback) {
  // Sem grupo ainda -> lista vazia (evita mostrar dados de outros grupos)
  if (!grupoId) {
    callback([]);
    return () => {};
  }

  const referencia = query(
    collection(db, 'familiares'),
    where('grupoId', '==', grupoId)
  );

  const cancelar = onSnapshot(referencia, (consulta) => {
    const familiares = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    callback(familiares);
  });

  return cancelar;
}

// Distância aproximada em metros entre duas coordenadas.
export function distanciaEmMetros(a, b) {
  const raioTerra = 6371000;
  const paraRad = (grau) => (grau * Math.PI) / 180;

  const dLat = paraRad(b.latitude - a.latitude);
  const dLon = paraRad(b.longitude - a.longitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRad(a.latitude)) *
      Math.cos(paraRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * raioTerra * Math.asin(Math.sqrt(h));
}

// ultimoEnvio: { latitude, longitude, em } da última gravação (ou null).
export function deveEnviarLocalizacao(ultimoEnvio, coordenadas, agora) {
  if (!ultimoEnvio) {
    return true;
  }

  const decorrido = agora - ultimoEnvio.em;

  if (decorrido < INTERVALO_MINIMO_ENVIO) {
    return false;
  }

  return (
    decorrido >= INTERVALO_MAXIMO_ENVIO ||
    distanciaEmMetros(ultimoEnvio, coordenadas) >= DISTANCIA_MINIMA_ENVIO
  );
}

/*
 * familiares/{uid} guarda a última localização conhecida.
 * O documento é substituído a cada envio (sem merge), então
 * "precisao" some quando o aparelho não a informa.
 * As regras conferem uid, grupoId e nome com usuarios/{uid}.
 */
export async function salvarLocalizacao({ uid, grupoId, nome, coordenadas }) {
  const localizacao = {
    uid,
    grupoId,
    nome,
    latitude: coordenadas.latitude,
    longitude: coordenadas.longitude,
    atualizadoEm: serverTimestamp(),
    online: true,
  };

  if (typeof coordenadas.accuracy === 'number' && coordenadas.accuracy >= 0) {
    localizacao.precisao = Math.round(coordenadas.accuracy);
  }

  await setDoc(doc(db, 'familiares', uid), localizacao);

  console.log(
    'Localização enviada:',
    uid,
    coordenadas.latitude,
    coordenadas.longitude
  );
}
