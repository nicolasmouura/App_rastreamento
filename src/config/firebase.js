import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3El0Q-oGUblkzcKBW5pv8qD_o3rtzd2g",
  authDomain: "apprastreamento-ffd42.firebaseapp.com",
  projectId: "apprastreamento-ffd42",
  storageBucket: "apprastreamento-ffd42.firebasestorage.app",
  messagingSenderId: "769246656990",
  appId: "1:769246656990:web:c1e2987fa23acf909c054f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);