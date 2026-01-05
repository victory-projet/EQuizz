// mobile-student/firebase.config.ts

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuration Firebase - À remplacer par vos vraies valeurs
const firebaseConfig = {
  apiKey: "AIzaSyBmIPM9RzAN1O88ro5MvYIMB80ncoT833k",
  authDomain: "equizz-cab71.firebaseapp.com",
  projectId: "equizz-cab71",
  storageBucket: "equizz-cab71.firebasestorage.app",
  messagingSenderId: "70167966214",
  appId: "1:70167966214:web:acdee11a3e3f9e83848987",
  measurementId: "G-4W5E3MHGFH"
};


// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Messaging (pour le web uniquement)
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase Messaging non disponible:', error);
  }
}

export { app, messaging };