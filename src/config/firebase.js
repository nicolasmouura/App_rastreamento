import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3El0Q-oGUblkzcKBW5pv8qD_o3rtzd2g",
  authDomain: "apprastreamento-ffd42.firebaseapp.com",
  projectId: "apprastreamento-ffd42",
  storageBucket: "apprastreamento-ffd42.firebasestorage.app",
  messagingSenderId: "769246656990",
  appId: "1:769246656990:web:c1e2987fa23acf909c054f"
};

// Reaproveita o app já criado (o hot reload executa este arquivo de novo).
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Sessão persistente pelo mecanismo oficial do Firebase (AsyncStorage).
// initializeAuth só pode ser chamado uma vez; no hot reload usa a instância existente.
function iniciarAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (erro) {
    if (erro?.code === "auth/already-initialized") {
      return getAuth(app);
    }

    throw erro;
  }
}

export const db = getFirestore(app);
export const auth = iniciarAuth();
