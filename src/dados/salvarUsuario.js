import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';

import { db } from '../config/firebase';

// Limites também conferidos no firestore.rules.
export const LIMITES_PERFIL = {
  nome: 60,
  telefone: 20,
  documento: 20,
  endereco: 120,
};

export async function salvarPerfilUsuario(usuario) {
  await setDoc(doc(db, 'usuarios', usuario.uid), {
    nome: usuario.nome,
    email: usuario.email,
    uid: usuario.uid,
    criadoEm: new Date().toISOString(),
  });

  console.log('Perfil salvo no Firebase:', usuario.uid);
}

/*
 * usuarios/{uid} é a fonte principal dos dados pessoais.
 * Usuários antigos podem não ter telefone, documento ou
 * endereço: esses campos voltam como texto vazio.
 */
function normalizarPerfil(uid, dados = {}) {
  return {
    ...dados,
    uid,
    nome: dados.nome || '',
    email: dados.email || '',
    telefone: dados.telefone || '',
    documento: dados.documento || '',
    endereco: dados.endereco || '',
  };
}

export async function buscarPerfil(uid) {
  const resultado = await getDoc(doc(db, 'usuarios', uid));

  return normalizarPerfil(
    uid,
    resultado.exists() ? resultado.data() : {}
  );
}

// Perfis dos membros da família. Um perfil que não puder
// ser lido não impede os demais de aparecerem.
export async function buscarPerfisDosMembros(uids) {
  const perfis = await Promise.all(
    uids.map(async (uid) => {
      try {
        const resultado = await getDoc(doc(db, 'usuarios', uid));

        return resultado.exists()
          ? normalizarPerfil(uid, resultado.data())
          : null;
      } catch (erro) {
        console.error('Erro ao buscar perfil do membro:', uid, erro);
        return null;
      }
    })
  );

  return Object.fromEntries(
    uids.map((uid, indice) => [uid, perfis[indice]])
  );
}

function formatarTelefone(telefone) {
  const digitos = telefone.replace(/\D/g, '');

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }

  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return telefone.trim();
}

// Retorna a mensagem de erro, ou null se os dados forem válidos.
export function validarPerfil({ nome, telefone, documento }) {
  if (!nome.trim()) {
    return 'Digite seu nome.';
  }

  const digitosTelefone = telefone.replace(/\D/g, '');

  if (!digitosTelefone) {
    return 'Digite seu telefone.';
  }

  if (digitosTelefone.length < 10 || digitosTelefone.length > 11) {
    return 'Digite um telefone válido, com DDD.';
  }

  if (!documento.trim()) {
    return 'Digite seu documento.';
  }

  if (documento.replace(/[^0-9a-z]/gi, '').length < 5) {
    return 'Digite um documento válido.';
  }

  return null;
}

// Mostra só os 2 últimos caracteres: 123.456.789-10 → •••.•••.•••-10
export function mascararDocumento(documento) {
  let visiveis = 2;

  return documento
    .split('')
    .reverse()
    .map((caractere) => {
      if (!/[0-9a-z]/i.test(caractere)) {
        return caractere;
      }

      if (visiveis > 0) {
        visiveis -= 1;
        return caractere;
      }

      return '•';
    })
    .reverse()
    .join('');
}

export async function atualizarPerfil(uid, dados) {
  const perfil = {
    nome: dados.nome.trim(),
    telefone: formatarTelefone(dados.telefone),
    documento: dados.documento.trim(),
    endereco: dados.endereco.trim(),
  };

  const referenciaPerfil = doc(db, 'usuarios', uid);
  const atual = await getDoc(referenciaPerfil);
  const grupoId = atual.exists() ? atual.data().grupoId : null;

  const lote = writeBatch(db);

  lote.set(
    referenciaPerfil,
    { ...perfil, atualizadoEm: new Date().toISOString() },
    { merge: true }
  );

  /*
   * grupos/{grupoId}/membros/{uid} guarda uma cópia do nome,
   * usada na lista da família e na regra de convites
   * ("Convidado por"). As duas cópias mudam juntas.
   */
  if (grupoId) {
    const referenciaMembro = doc(db, 'grupos', grupoId, 'membros', uid);
    const membro = await getDoc(referenciaMembro);

    if (membro.exists() && membro.data().nome !== perfil.nome) {
      lote.update(referenciaMembro, { nome: perfil.nome });
    }
  }

  await lote.commit();

  console.log('Perfil atualizado:', uid);

  return perfil;
}
