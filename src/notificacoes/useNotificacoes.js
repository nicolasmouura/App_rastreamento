import { useEffect } from 'react';

import { observarFamiliares } from '../dados/buscarFamiliares';
import { observarConvitesEnviados, observarConvitesRecebidos } from '../dados/convites';
import { observarMembros } from '../dados/grupo';
import { observarSOSAtivos } from '../dados/sos';
import {
  avisosDeConvitesRecebidos,
  avisosDeLocalizacao,
  avisosDeMembros,
  avisosDeRespostas,
  avisosDeSOS,
  lerMarcas,
  lerPreferencias,
  notificar,
  pedirPermissao,
  salvarMarcas,
} from '../dados/notificacoes';

// Marcas já carregadas, por usuário: trocar de família reinicia os
// observadores sem reler o AsyncStorage (evita avisar em dobro).
const marcasCarregadas = new Map();

async function marcasDe(uid) {
  if (!marcasCarregadas.has(uid)) {
    marcasCarregadas.set(uid, await lerMarcas(uid));
  }

  return marcasCarregadas.get(uid);
}

/*
 * Observa, enquanto a conta estiver aberta, os eventos das
 * notificações (Configurações → Notificações) e mostra um aviso
 * no aparelho para cada evento novo cujo tipo esteja ligado:
 *   SOS · convites recebidos · convites enviados aceitos/recusados ·
 *   novos membros · localização dos familiares.
 * grupoId null (sem família): só os convites.
 */
export function useNotificacoes(usuario, grupoId) {
  const uid = usuario?.uid;

  useEffect(() => {
    if (!uid) return undefined;

    let ativo = true;
    const cancelamentos = [];

    // Convites que enviei e já foram aceitos: com "Convites aceitos"
    // ligado, o "Novo membro" da mesma pessoa não é avisado de novo.
    const aceitosPorMim = new Set();

    async function avisar(avisos) {
      if (!avisos.length) return;

      const preferencias = await lerPreferencias(uid);

      for (const aviso of avisos) {
        if (!ativo) return;
        if (!preferencias[aviso.tipo]) continue;

        const repetido =
          aviso.tipo === 'novosMembros'
          && preferencias.aprovacoes
          && aceitosPorMim.has(aviso.conviteId);

        if (!repetido) await notificar(aviso);
      }
    }

    function falhou(erro) {
      console.log('Notificações: leitura falhou:', erro.code || erro.message);
    }

    async function iniciar() {
      // Pede a permissão antes de observar, para os primeiros avisos
      // não se perderem. Com ela negada, as marcas avançam igual.
      await pedirPermissao();

      const marcas = await marcasDe(uid);

      if (!ativo) return;

      cancelamentos.push(
        observarConvitesRecebidos((convites) => {
          const { marca, avisos } = avisosDeConvitesRecebidos(convites, marcas.convites);

          marcas.convites = marca;
          salvarMarcas(uid, marcas);
          avisar(avisos);
        }, falhou)
      );

      cancelamentos.push(
        observarConvitesEnviados(uid, (convites) => {
          convites
            .filter((convite) => convite.status === 'aceito')
            .forEach((convite) => aceitosPorMim.add(convite.id));

          const { marca, avisos } = avisosDeRespostas(convites, marcas.respostas);

          marcas.respostas = marca;
          salvarMarcas(uid, marcas);
          avisar(avisos);
        }, falhou)
      );

      if (!grupoId) return;

      cancelamentos.push(
        observarSOSAtivos(grupoId, (alertas) => {
          const { marca, avisos } = avisosDeSOS(alertas, uid, marcas.sos);

          marcas.sos = marca;
          salvarMarcas(uid, marcas);
          avisar(avisos);
        }, falhou)
      );

      cancelamentos.push(
        observarMembros(grupoId, (membros) => {
          const { marca, avisos } = avisosDeMembros(membros, uid, marcas.membros);

          marcas.membros = marca;
          salvarMarcas(uid, marcas);
          avisar(avisos);
        }, falhou)
      );

      cancelamentos.push(
        observarFamiliares(grupoId, (familiares) => {
          const resultado = avisosDeLocalizacao(
            familiares,
            uid,
            marcas.localizacao,
            marcas.inicio
          );

          marcas.localizacao = resultado.marcas;
          salvarMarcas(uid, marcas);
          avisar(resultado.avisos);
        }, falhou)
      );
    }

    iniciar().catch(falhou);

    return () => {
      ativo = false;
      cancelamentos.forEach((cancelar) => cancelar());
    };
  }, [uid, grupoId]);
}
