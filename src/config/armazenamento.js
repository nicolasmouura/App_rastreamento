// Por enquanto o app guarda tudo no aparelho (AsyncStorage), sem Firebase.
// Mesmos "auth" e "db" que o antigo config/firebase.js exportava.
export { auth } from '../armazenamento/contasLocais';
export { db } from '../armazenamento/bancoLocal';
