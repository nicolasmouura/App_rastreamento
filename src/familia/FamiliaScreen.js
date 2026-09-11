import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ListaMembros from './ListaMembros';
import AdicionarMembro from './AdicionarMembro';
import FormularioMembro from './FormularioMembro';

import { observarFamiliares } from '../dados/buscarFamiliares';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function FamiliaScreen({ familiares, setFamiliares, grupoId }) {
  useEffect(() => {
    const cancelar = observarFamiliares(grupoId, (dados) => {
      setFamiliares(dados);
    });

    return () => cancelar();
  }, [grupoId]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const adicionarMembro = () => {
    setMostrarFormulario(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Família</Text>

      <Text style={styles.subtitle}>
        Pessoas que compartilham a localização com você
      </Text>

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
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    width: '90%',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 25,
  },
});