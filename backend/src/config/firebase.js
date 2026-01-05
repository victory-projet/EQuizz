// backend/src/config/firebase.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

/**
 * Initialise Firebase Admin SDK
 */
function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Chemin vers le fichier de configuration
    const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');
    
    // Vérifier si le fichier existe et l'utiliser en priorité
    if (fs.existsSync(serviceAccountPath)) {
      console.log('📁 Utilisation du fichier de configuration Firebase');
      
      // Lire et parser le fichier JSON
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      // Initialiser avec le fichier JSON
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase Admin SDK initialisé avec succès (fichier JSON)');
      return firebaseApp;
    }

    // Fallback: Configuration Firebase depuis les variables d'environnement
    console.log('🔧 Fichier service account non trouvé, utilisation des variables d\'environnement');
    
    const firebaseConfig = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Vérifier que les variables essentielles sont présentes
    if (!firebaseConfig.project_id || !firebaseConfig.private_key || !firebaseConfig.client_email) {
      console.warn('⚠️  Configuration Firebase incomplète. Push notifications désactivées.');
      return null;
    }

    console.log('🔧 Utilisation des variables d\'environnement Firebase');

    // Initialiser Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      projectId: firebaseConfig.project_id
    });

    console.log('✅ Firebase Admin SDK initialisé avec succès (variables env)');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

/**
 * Obtient l'instance Firebase Admin
 */
function getFirebaseApp() {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Obtient l'instance Firebase Messaging
 */
function getMessaging() {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  return admin.messaging(app);
}

/**
 * Vérifie si Firebase est configuré
 */
function isFirebaseConfigured() {
  const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');
  
  return firebaseApp !== null || 
         fs.existsSync(serviceAccountPath) || 
         (process.env.FIREBASE_PROJECT_ID && 
          process.env.FIREBASE_PRIVATE_KEY && 
          process.env.FIREBASE_CLIENT_EMAIL);
}

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  getMessaging,
  isFirebaseConfigured
};