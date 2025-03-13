
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2AEvLCm2hs8UVtc2pIBD6fh164N4Y4Yg",
  authDomain: "neobond-d690a.firebaseapp.com",
  databaseURL: "https://neobond-d690a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "neobond-d690a",
  storageBucket: "neobond-d690a.firebasestorage.app",
  messagingSenderId: "764563208664",
  appId: "1:764563208664:web:482cd48fcb29b61afedaad"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
