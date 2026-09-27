import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { garantirSemFamilia } from './grupo';

const EMAIL_VALIDO = /^[^@/\s]+@[^@/\s]+\.[^@/\s]+$/;

const MENSAGENS = {
  JA_POSSUI_FAMILIA: 'Você já pertence a uma família.',
  EMAIL_INVALIDO: 'Digite um e-mail válido.',
  CONVITE_PARA_SI_MESMO: 'Você não pode convidar a si mesmo.',
  CONVITE_JA_PENDENTE: 'Já existe um convite pendente para este e-mail.',
  JA_E_MEMBRO: 'Essa pessoa já faz parte da família.',
  CONVITE_INDISPONIVEL: 'Este convite não está mais disponível.',
};

export function mensagemDeErro(erro, mensagemPadrao) {
  return MENSAGENS[erro?.message] || mensagemPadrao;
}

export function normalizarEmail(email) {
  return (email || '').trim().toLowerCase();
}

// Um convite por família + e-mail. As regras do Firestore
// usam esse mesmo formato para localizar o convite.
function idDoConvite(grupoId, email) {
  return `${grupoId}_${email}`;
}

function emailAtual() {
  return normalizarEmail(auth.currentUser?.email);
}

function mapearConvites(consulta) {
  return consulta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function enviarConvite({ grupo, remetente, email }) {
  const paraEmail = normalizarEmail(email);

  if (!EMAIL_VALIDO.test(paraEmail)) {
    throw new Error('EMAIL_INVALIDO');
  }

  if (paraEmail === emailAtual()) {
    throw new Error('CONVITE_PARA_SI_MESMO');
  }

  const referencia = doc(
    db,
    'convites',
    idDoConvite(grupo.id, paraEmail)
  );

  const existente = await getDoc(referencia);

  if (existente.exists()) {
    const { status } = existente.data();

    if (status === 'pendente') {
      throw new Error('CONVITE_JA_PENDENTE');
    }

    if (status === 'aceito') {
      throw new Error('JA_E_MEMBRO');
    }
  }

  // Um convite recusado pode ser reenviado (sobrescreve o anterior).
  await setDoc(referencia, {
    grupoId: grupo.id,
    grupoNome: grupo.nome,
    deUid: remetente.uid,
    deNome: remetente.nome,
    paraEmail,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  });

  console.log('Convite enviado:', referencia.id);
}

export function observarConvitesRecebidos(callback, onErro) {
  const email = emailAtual();

  if (!email) {
    callback([]);
    return () => {};
  }

  const consulta = query(
    collection(db, 'convites'),
    where('paraEmail', '==', email),
    where('status', '==', 'pendente')
  );

  return onSnapshot(
    consulta,
    (resultado) => callback(mapearConvites(resultado)),
    onErro
  );
}

export function observarConvitesPendentesDoGrupo(
  grupoId,
  callback,
  onErro
) {
  const consulta = query(
    collection(db, 'convites'),
    where('grupoId', '==', grupoId),
    where('status', '==', 'pendente')
  );

  return onSnapshot(
    consulta,
    (resultado) => callback(mapearConvites(resultado)),
    onErro
  );
}

export async function aceitarConvite(convite, usuario) {
  await garantirSemFamilia(usuario.uid);

  const agora = new Date().toISOString();

  /*
   * As quatro gravações precisam acontecer juntas.
   * As regras só permitem entrar no grupo quando o
   * convite pendente passa para "aceito" no mesmo lote.
   */
  const lote = writeBatch(db);

  lote.update(doc(db, 'convites', convite.id), {
    status: 'aceito',
    paraUid: usuario.uid,
    respondidoEm: agora,
  });

  lote.update(doc(db, 'grupos', convite.grupoId), {
    membros: arrayUnion(usuario.uid),
  });

  lote.set(
    doc(db, 'grupos', convite.grupoId, 'membros', usuario.uid),
    {
      uid: usuario.uid,
      nome: usuario.nome || 'Usuário',
      papel: 'membro',
      status: 'ativo',
      entrouEm: agora,
      conviteId: convite.id,
    }
  );

  lote.set(
    doc(db, 'usuarios', usuario.uid),
    { grupoId: convite.grupoId },
    { merge: true }
  );

  await lote.commit();

  console.log('Convite aceito:', convite.id);
}

export async function recusarConvite(convite, usuario) {
  await updateDoc(doc(db, 'convites', convite.id), {
    status: 'recusado',
    paraUid: usuario.uid,
    respondidoEm: new Date().toISOString(),
  });

  console.log('Convite recusado:', convite.id);
}
