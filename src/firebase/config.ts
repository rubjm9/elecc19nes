// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJvvgffjS_U3B1iBgohQQz75TbunlH0YM",
  authDomain: "elecc19nes.firebaseapp.com",
  projectId: "elecc19nes",
  storageBucket: "elecc19nes.firebasestorage.app",
  messagingSenderId: "503535169141",
  appId: "1:503535169141:web:6eed0a38923cab882ed23c",
  measurementId: "G-WY43PJVF39"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Analytics (opcional)
export const analytics = getAnalytics(app);

export default app;
