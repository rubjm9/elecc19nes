// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJvvgffjS_U3B1iBgohQQz75TbunlH0YM",
  authDomain: "elecc19nes.firebaseapp.com",
  projectId: "elecc19nes",
  storageBucket: "elecc19nes.appspot.com",
  messagingSenderId: "503535169141",
  appId: "1:503535169141:web:6eed0a38923cab882ed23c",
  measurementId: "G-WY43PJVF39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default getFirestore();