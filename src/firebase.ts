// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAu-b9Dweanv_X4-dEooPGBdPzGPb7ApPo",
  authDomain: "price-manager-2026.firebaseapp.com",
  projectId: "price-manager-2026",
  storageBucket: "price-manager-2026.firebasestorage.app",
  messagingSenderId: "333577703019",
  appId: "1:333577703019:web:681d86a5b61a565351eb2e",
  measurementId: "G-15JS850DES"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
