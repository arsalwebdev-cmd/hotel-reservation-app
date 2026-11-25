import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAmaB6wBcenNZALwz-VVclnyJZMLyjR-kM",
  authDomain: "reservation-web-app-6438d.firebaseapp.com",
  projectId: "reservation-web-app-6438d",
  storageBucket: "reservation-web-app-6438d.firebasestorage.app",
  messagingSenderId: "1065553133279",
  appId: "1:1065553133279:web:7f8cbacc3f7ae9c2c6336a",
  measurementId: "G-VL2FRXGN1T"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline data persistence
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore offline persistence has been enabled.");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence could not be enabled. Multiple tabs might be open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.');
      } else {
        console.error('Error enabling Firestore persistence:', err);
      }
    });
} catch (error) {
  console.error('Error setting up Firestore:', error);
}

// Initialize Analytics only in browser environment
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Firebase Analytics could not be initialized:', error);
}

export { analytics };
export default app; 