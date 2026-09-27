import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import Mapa from './Mapa';
import StatusLocalizacao from './StatusLocalizacao';
import { descreverLocalizacao } from './compartilharLocalizacao';

import { observarFamiliares } from '../dados/buscarFamiliares';

// O compartilhamento da localização roda no App
// (useCompartilharLocalizacao); aqui só exibimos o estado.
export default function TelaMapa({ usuario, grupoId, localizacao }) {
  const [familiares, setFamiliares] = useState([]);

  // Familiares vindos do Firebase em tempo real
  useEffect(() => {
    if (!grupoId) {
      return;
    }

    const cancelar = observarFamiliares(
      grupoId,
      (dados) => {
        setFamiliares(dados);
      }
    );

    return () => cancelar();
  }, [grupoId]);

  const descricao = descreverLocalizacao(localizacao);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" hidden />

      <Mapa
        location={localizacao.coordenadas}
        familiares={familiares.filter(
          (membro) => membro.id !== usuario?.uid
        )}
      />

      <StatusLocalizacao
        ativo={descricao.ativo}
        texto={`${descricao.titulo}\n${descricao.detalhe}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
