import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function observarFamiliares(callback) {
  const referencia = collection(db, 'familiares');

  const cancelar = onSnapshot(referencia, (consulta) => {
    const familiares = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    callback(familiares);
  });

  return cancelar;
}