// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAJvvgffjS_U3B1iBgohQQz75TbunlH0YM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "elecc19nes.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "elecc19nes",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "elecc19nes.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Analytics (opcional)
export const analytics = getAnalytics(app);

export default app;
