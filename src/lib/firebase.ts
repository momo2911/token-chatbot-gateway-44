
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC6_dDLUKZQAKHl0jNHmoqRbYOEG_H2wBw",
  authDomain: "token-gateway-demo.firebaseapp.com",
  projectId: "token-gateway-demo",
  storageBucket: "token-gateway-demo.appspot.com",
  messagingSenderId: "509956544958",
  appId: "1:509956544958:web:f9b6605c8f91c76845b8d8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
