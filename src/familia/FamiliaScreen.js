import { useState, useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Share,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import ListaMembros from './ListaMembros';
import CodigoConvite from './CodigoConvite';
import GrupoScreen from '../grupo/GrupoScreen';

import { observarFamiliares } from '../dados/buscarFamiliares';
import { buscarGrupoPorId } from '../dados/grupo';

import { cores, fontes, raio } from '../theme/theme';

export default function FamiliaScreen({
  familiares,
  setFamiliares,
  grupoId,
  usuario,
  onGrupoConcluido,
}) {
  const [grupoInfo, setGrupoInfo] = useState(null);
  const [mostrarConvite, setMostrarConvite] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

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

  const souHost =
    grupoInfo?.administradorUid === usuario?.uid;

  const copiarCodigo = async () => {
    if (!grupoInfo?.codigoConvite) {
      return;
    }

    await Clipboard.setStringAsync(
      grupoInfo.codigoConvite
    );

    setCodigoCopiado(true);

    setTimeout(() => {
      setCodigoCopiado(false);
    }, 2500);
  };

  const compartilharConvite = async () => {
    if (!grupoInfo?.codigoConvite) {
      return;
    }

    try {
      await Share.share({
        message:
          `Você foi convidado para participar da minha família no Conecta!\n\n` +
          `Instale o aplicativo Conecta e entre no grupo usando este código:\n\n` +
          `${grupoInfo.codigoConvite}\n\n` +
          `Depois, aceite o compartilhamento da localização para que possamos acompanhar uns aos outros no mapa.`,
      });
    } catch (erro) {
      console.error(
        'Erro ao compartilhar convite:',
        erro
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Minha Família
      </Text>

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

      <TouchableOpacity
        style={styles.botaoConvidar}
        onPress={() => {
          setCodigoCopiado(false);
          setMostrarConvite(true);
        }}
      >
        <Text style={styles.botaoConvidarTexto}>
          + Convidar familiar
        </Text>
      </TouchableOpacity>

      <Modal
        visible={mostrarConvite}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMostrarConvite(false)
        }
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>
              Convidar familiar
            </Text>

            <Text style={styles.modalTexto}>
              Para participar da sua família, a pessoa
              precisa instalar o Conecta e entrar no seu
              grupo usando o código abaixo.
            </Text>

            <Text style={styles.modalTexto}>
              Depois de entrar, ela poderá permitir o
              compartilhamento da localização.
            </Text>

            <Text style={styles.modalLabel}>
              Código do grupo
            </Text>

            <Text style={styles.modalCodigo}>
              {grupoInfo?.codigoConvite}
            </Text>

            {codigoCopiado && (
              <Text style={styles.codigoCopiado}>
                ✓ Código copiado!
              </Text>
            )}

            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={copiarCodigo}
            >
              <Text style={styles.botaoPrincipalTexto}>
                Copiar código
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCompartilhar}
              onPress={compartilharConvite}
            >
              <Text style={styles.botaoCompartilharTexto}>
                Compartilhar convite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() =>
                setMostrarConvite(false)
              }
            >
              <Text style={styles.botaoFecharTexto}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  botaoConvidar: {
    width: '90%',
    padding: 16,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  botaoConvidarTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },

  modalTitulo: {
    fontSize: 24,
    fontFamily: fontes.titulo,
    color: cores.texto,
    marginBottom: 15,
    textAlign: 'center',
  },

  modalTexto: {
    width: '100%',
    textAlign: 'center',
    color: cores.textoSecundario,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },

  modalLabel: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginTop: 8,
    marginBottom: 5,
  },

  modalCodigo: {
    fontSize: 32,
    fontFamily: fontes.titulo,
    color: cores.texto,
    letterSpacing: 4,
    marginBottom: 8,
  },

  codigoCopiado: {
    color: cores.primaria,
    fontSize: 15,
    fontFamily: fontes.destaque,
    marginBottom: 12,
  },

  botaoPrincipal: {
    width: '100%',
    padding: 15,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },

  botaoPrincipalTexto: {
    color: cores.textoSobrePrimaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  botaoCompartilhar: {
    width: '100%',
    padding: 15,
    borderRadius: raio.botaoSecundario,
    borderWidth: 1,
    borderColor: cores.primaria,
    alignItems: 'center',
    marginBottom: 10,
  },

  botaoCompartilharTexto: {
    color: cores.primaria,
    fontSize: 16,
    fontFamily: fontes.destaque,
  },

  botaoFechar: {
    padding: 12,
  },

  botaoFecharTexto: {
    color: cores.textoSecundario,
    fontSize: 15,
  },
});
