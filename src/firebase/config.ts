import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmaB6wBcenNZALwz-VVclnyJZMLyjR-kM",
  authDomain: "reservation-web-app-6438d.firebaseapp.com",
  projectId: "reservation-web-app-6438d",
  storageBucket: "reservation-web-app-6438d.firebasestorage.app",
  messagingSenderId: "1065553133279",
  appId: "1:1065553133279:web:7f8cbacc3f7ae9c2c6336a",
  measurementId: "G-VL2FRXGN1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 