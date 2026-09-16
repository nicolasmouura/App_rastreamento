import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ListaMembros from './ListaMembros';
import AdicionarMembro from './AdicionarMembro';
import FormularioMembro from './FormularioMembro';
import CodigoConvite from './CodigoConvite';
import GrupoScreen from '../grupo/GrupoScreen';

import { observarFamiliares } from '../dados/buscarFamiliares';
import { buscarGrupoPorId } from '../dados/grupo';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { cores, fontes } from '../theme/theme';

export default function FamiliaScreen({
  familiares,
  setFamiliares,
  grupoId,
  usuario,
  onGrupoConcluido,
}) {
  const [grupoInfo, setGrupoInfo] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    if (!grupoId) return;

    const cancelar = observarFamiliares(grupoId, (dados) => {
      setFamiliares(dados);
    });

    return () => cancelar();
  }, [grupoId]);

  useEffect(() => {
    async function carregarGrupo() {
      const grupo = await buscarGrupoPorId(grupoId);
      setGrupoInfo(grupo);
    }

    if (grupoId) {
      carregarGrupo();
    }
  }, [grupoId]);

  if (!grupoId) {
    return (
      <GrupoScreen
        usuario={usuario}
        onGrupoConcluido={onGrupoConcluido}
      />
    );
  }

  const souHost = grupoInfo?.administradorUid === usuario?.uid;

  const adicionarMembro = () => {
    setMostrarFormulario(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Família</Text>

      <Text style={styles.subtitle}>
        Pessoas que compartilham a localização com você
      </Text>

      {souHost && grupoInfo && (
        <CodigoConvite
          codigo={grupoInfo.codigoConvite}
          nomeGrupo={grupoInfo.nome}
        />
      )}

      <ListaMembros membros={familiares} />

      {mostrarFormulario ? (
        <FormularioMembro
          onAdicionar={async (novoMembro) => {
            try {
              const membro = {
                uid: `membro-${Date.now()}`,
                grupoId: grupoId,
                nome: novoMembro.nome,
                parentesco: novoMembro.parentesco,
                latitude: -22.5245,
                longitude: -43.6815,
                online: false,
              };

              const documento = await addDoc(
                collection(db, 'familiares'),
                membro
              );

              const membroSalvo = {
                id: documento.id,
                ...membro,
              };

              setFamiliares((atual) => [...atual, membroSalvo]);
              setMostrarFormulario(false);

              console.log('Membro salvo no Firebase:', membroSalvo);
            } catch (erro) {
              console.error('Erro ao salvar membro:', erro);
            }
          }}
          onCancelar={() => setMostrarFormulario(false)}
        />
      ) : (
        <AdicionarMembro onPress={adicionarMembro} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: cores.fundo,
  },

  title: {
    fontSize: 26,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 8,
  },

  subtitle: {
    width: '90%',
    textAlign: 'center',
    color: cores.textoSecundario,
    marginBottom: 25,
  },
});