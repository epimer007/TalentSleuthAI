// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBP9qGInLrUFz8I6qLjdGVzl03u0L-SSSM",
  authDomain: "talentsleuth-27ad4.firebaseapp.com",
  projectId: "talentsleuth-27ad4",
  storageBucket: "talentsleuth-27ad4.firebasestorage.app",
  messagingSenderId: "177465403993",
  appId: "1:177465403993:web:adc492616b167dc454df48",
  measurementId: "G-H0L30NE6V4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
