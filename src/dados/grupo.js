import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { db } from '../config/firebase';

function gerarCodigoConvite() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let codigo = '';

  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }

  return codigo;
}

export async function criarGrupo(nomeGrupo, usuario) {
  const codigoConvite = gerarCodigoConvite();

  const grupo = {
    nome: nomeGrupo.trim(),
    codigoConvite: codigoConvite,
    administradorUid: usuario.uid,
    membros: [usuario.uid],
    criadoEm: new Date().toISOString(),
  };

  const referencia = await addDoc(
    collection(db, 'grupos'),
    grupo
  );

  console.log('Grupo criado:', referencia.id);
  console.log('Código de convite:', codigoConvite);

  return {
    id: referencia.id,
    ...grupo,
  };
}

export async function procurarGrupoPorCodigo(codigoConvite) {
  const codigo = codigoConvite.trim().toUpperCase();

  const consulta = query(
    collection(db, 'grupos'),
    where('codigoConvite', '==', codigo)
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return null;
  }

  const documento = resultado.docs[0];

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function solicitarEntrada(grupoId, usuario) {
  const solicitacao = {
    grupoId: grupoId,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
    usuarioEmail: usuario.email,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  };

  const referencia = await addDoc(
    collection(db, 'solicitacoes'),
    solicitacao
  );

  console.log(
    'Solicitação criada:',
    referencia.id
  );

  return {
    id: referencia.id,
    ...solicitacao,
  };
}