import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRniGrnERHZqQoxCDiixXVUWNRg_dDBdU",
  authDomain: "chipsandkids-150ea.firebaseapp.com",
  projectId: "chipsandkids-150ea",
  storageBucket: "chipsandkids-150ea.firebasestorage.app",
  messagingSenderId: "263132498302",
  appId: "1:263132498302:web:db398f3e00e3c8d02d4b2f",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
