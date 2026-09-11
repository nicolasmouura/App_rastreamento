import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export function observarFamiliares(grupoId, callback) {
  // Sem grupo ainda -> lista vazia (evita mostrar dados de outros grupos)
  if (!grupoId) {
    callback([]);
    return () => {};
  }

  const referencia = query(
    collection(db, 'familiares'),
    where('grupoId', '==', grupoId)
  );

  const cancelar = onSnapshot(referencia, (consulta) => {
    const familiares = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    callback(familiares);
  });

  return cancelar;
}