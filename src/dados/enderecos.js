import * as Location from 'expo-location';

import { distanciaEmMetros } from './buscarFamiliares';

/*
 * Rua atual (geocodificação reversa do próprio aparelho, via
 * expo-location). Quem consulta é o dono da posição, uma vez por
 * deslocamento relevante; a família recebe só o nome da rua em
 * familiares/{uid}.rua.
 */
export const DISTANCIA_NOVA_RUA = 100; // metros
export const INTERVALO_MINIMO_RUA = 60 * 1000; // no máximo 1 consulta por minuto

// Só o nome da rua (sem número). Sem rua: bairro ou cidade.
export function nomeDaRua(endereco) {
  const nome = endereco?.street || endereco?.district || endereco?.city || null;

  return nome ? nome.trim().slice(0, 120) : null;
}

// Endereço completo para exibir/editar em "Meus lugares".
export function formatarEnderecoCompleto(endereco) {
  if (!endereco) return '';

  const rua = [endereco.street, endereco.streetNumber].filter(Boolean).join(', ');
  const cidade = [endereco.city || endereco.subregion, endereco.region].filter(Boolean).join(' - ');

  return [rua, endereco.district, cidade].filter(Boolean).join(', ');
}

export function deveBuscarRua(ultima, posicao, agora) {
  if (!ultima) return true;
  if (agora - ultima.em < INTERVALO_MINIMO_RUA) return false;
  if (!ultima.rua) return true; // última tentativa falhou: tenta de novo

  return distanciaEmMetros(ultima, posicao) >= DISTANCIA_NOVA_RUA;
}

// Uma consulta lenta nunca pode segurar o envio da localização.
const TEMPO_MAXIMO_CONSULTA = 5000;

export async function buscarEndereco(posicao) {
  try {
    const resultados = await Promise.race([
      Location.reverseGeocodeAsync({
        latitude: posicao.latitude,
        longitude: posicao.longitude,
      }),
      new Promise((resolve) => setTimeout(() => resolve(null), TEMPO_MAXIMO_CONSULTA)),
    ]);

    return resultados?.[0] || null;
  } catch (erro) {
    console.log('Endereço indisponível:', erro.code || erro.message);
    return null;
  }
}

// Endereço digitado → coordenadas (cadastro de lugares). null se não achar.
export async function buscarCoordenadas(texto) {
  if (!texto || !texto.trim()) return null;

  try {
    const resultados = await Location.geocodeAsync(texto.trim());
    const primeiro = resultados?.[0];

    return primeiro ? { latitude: primeiro.latitude, longitude: primeiro.longitude } : null;
  } catch (erro) {
    console.log('Endereço não localizado:', erro.code || erro.message);
    return null;
  }
}

/*
 * Cache da rua para o watcher: reaproveita o último resultado
 * enquanto a posição não muda de forma relevante. Se a consulta
 * falhar, mantém a última rua conhecida.
 */
export function criarCacheRua(buscar = buscarEndereco) {
  let ultima = null; // { latitude, longitude, em, rua }

  return async function ruaAtual(posicao, agora) {
    if (!deveBuscarRua(ultima, posicao, agora)) {
      return ultima.rua;
    }

    const rua = nomeDaRua(await buscar(posicao));

    ultima = {
      latitude: posicao.latitude,
      longitude: posicao.longitude,
      em: agora,
      rua: rua ?? ultima?.rua ?? null,
    };

    return ultima.rua;
  };
}
