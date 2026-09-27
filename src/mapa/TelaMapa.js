import { StyleSheet, View } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';

import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';
import { descreverLocalizacao } from './compartilharLocalizacao';

import {
  montarMarcadores,
  observarFamiliares,
} from '../dados/buscarFamiliares';
import { observarMembros } from '../dados/grupo';

// Atualiza os textos "Atualizado há X min" sem novas leituras.
const INTERVALO_RELOGIO = 30 * 1000;

// O compartilhamento da localização roda no App
// (useCompartilharLocalizacao); aqui a família é exibida.
export default function TelaMapa({ usuario, grupoId, localizacao }) {
  // null = ainda carregando
  const [membros, setMembros] = useState(null);
  const [localizacoes, setLocalizacoes] = useState(null);
  const [erro, setErro] = useState('');
  const [agora, setAgora] = useState(Date.now());

  // Um listener para os membros e um para as localizações da família.
  // Ambos são encerrados ao sair do mapa.
  useEffect(() => {
    if (!grupoId) {
      setMembros([]);
      setLocalizacoes([]);
      return;
    }

    function falhou(e) {
      console.error('Erro ao carregar o mapa da família:', e);
      setErro('Não foi possível carregar as localizações da família.');
    }

    const cancelarMembros = observarMembros(grupoId, setMembros, falhou);
    const cancelarLocalizacoes = observarFamiliares(
      grupoId,
      setLocalizacoes,
      falhou
    );

    return () => {
      cancelarMembros();
      cancelarLocalizacoes();
    };
  }, [grupoId]);

  useEffect(() => {
    const relogio = setInterval(
      () => setAgora(Date.now()),
      INTERVALO_RELOGIO
    );

    return () => clearInterval(relogio);
  }, []);

  const coordenadas = localizacao.coordenadas;

  const minhaPosicao =
    localizacao.status === 'compartilhando' && coordenadas
      ? {
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
          atualizadoEm: localizacao.atualizadoEm,
        }
      : null;

  const pronto = membros !== null && localizacoes !== null;

  const { marcadores, semLocalizacao } = useMemo(
    () =>
      montarMarcadores({
        membros: membros || [],
        localizacoes: localizacoes || [],
        meuUid: usuario?.uid,
        meuNome: usuario?.nome,
        minhaPosicao,
        agora,
      }),
    [
      membros,
      localizacoes,
      usuario?.uid,
      usuario?.nome,
      minhaPosicao?.latitude,
      minhaPosicao?.longitude,
      minhaPosicao?.atualizadoEm,
      agora,
    ]
  );

  const descricao = descreverLocalizacao(localizacao);
  const linhas = [descricao.titulo, descricao.detalhe];

  if (erro) {
    linhas.push(erro);
  } else if (pronto) {
    if (descricao.ativo && !marcadores.some((marcador) => marcador.voce)) {
      linhas.push('Sua localização ainda não está disponível.');
    }

    if (marcadores.length === 0) {
      linhas.push('Nenhuma localização disponível.');
    }

    const outrosSemLocalizacao = semLocalizacao
      .filter((pessoa) => !pessoa.voce)
      .map((pessoa) =>
        pessoa.motivo === 'invalida'
          ? `${pessoa.nome} (localização inválida)`
          : pessoa.nome
      );

    if (outrosSemLocalizacao.length > 0) {
      linhas.push(`Localização indisponível: ${outrosSemLocalizacao.join(', ')}`);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" hidden />

      <Mapa
        marcadores={marcadores}
        pronto={pronto}
      />

      <StatusLocalizacao
        ativo={descricao.ativo}
        texto={linhas.join('\n')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
