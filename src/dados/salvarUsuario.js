import { doc, setDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

export async function salvarPerfilUsuario(usuario) {
  await setDoc(doc(db, 'usuarios', usuario.uid), {
    nome: usuario.nome,
    email: usuario.email,
    uid: usuario.uid,
    criadoEm: new Date().toISOString(),
  });

  console.log('Perfil salvo no Firebase:', usuario.uid);
}