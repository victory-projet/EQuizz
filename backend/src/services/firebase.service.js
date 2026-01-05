// backend/src/services/firebase.service.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.messaging = null;
    this.init();
  }

  init() {
    try {
      // Vérifier si Firebase est déjà initialisé
      if (admin.apps.length > 0) {
        this.messaging = admin.messaging();
        this.initialized = true;
        console.log('✅ Firebase déjà initialisé');
        return;
      }

      // Chercher le fichier de configuration Firebase
      const serviceAccountPaths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        path.join(__dirname, '../../config/firebase-service-account.json'),
        path.join(__dirname, '../../firebase-service-account.json'),
        './firebase-service-account.json'
      ].filter(Boolean);

      let serviceAccount = null;
      let configPath = null;

      // Essayer de charger depuis une variable d'environnement JSON
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          console.log('📱 Configuration Firebase chargée depuis la variable d\'environnement');
        } catch (error) {
          console.warn('⚠️ Erreur parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
        }
      }

      // Si pas de config depuis l'env, chercher un fichier
      if (!serviceAccount) {
        for (const filePath of serviceAccountPaths) {
          if (fs.existsSync(filePath)) {
            serviceAccount = require(filePath);
            configPath = filePath;
            console.log(`📱 Configuration Firebase chargée depuis: ${filePath}`);
            break;
          }
        }
      }

      if (!serviceAccount) {
        console.warn('⚠️ Configuration Firebase non trouvée. Notifications push désactivées.');
        console.log('💡 Pour activer les notifications push:');
        console.log('   1. Téléchargez votre fichier de service account Firebase');
        console.log('   2. Placez-le dans backend/config/firebase-service-account.json');
        console.log('   3. Ou définissez FIREBASE_SERVICE_ACCOUNT_JSON dans vos variables d\'environnement');
        return;
      }

      // Initialiser Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      this.messaging = admin.messaging();
      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialisé avec succès');

    } catch (error) {
      console.error('❌ Erreur initialisation Firebase:', error.message);
      this.initialized = false;
    }
  }

  /**
   * Envoie une notification push à un token spécifique
   * @param {string} token - Token FCM de l'appareil
   * @param {Object} notification - Données de notification
   * @param {Object} data - Données personnalisées (optionnel)
   */
  async sendToToken(token, notification, data = {}) {
    if (!this.initialized) {
      console.warn('⚠️ Firebase non initialisé, notification push ignorée');
      return { success: false, error: 'Firebase non initialisé' };
    }

    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#2196F3',
            sound: 'default',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('✅ Notification push envoyée:', response);
      return { success: true, messageId: response };

    } catch (error) {
      console.error('❌ Erreur envoi notification push:', error.message);
      
      // Gérer les tokens invalides
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        return { success: false, error: 'Token invalide', shouldRemoveToken: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie une notification push à plusieurs tokens
   * @param {Array<string>} tokens - Liste des tokens FCM
   * @param {Object} notification - Données de notification
   * @param {Object} data - Données personnalisées (optionnel)
   */
  async sendToMultipleTokens(tokens, notification, data = {}) {
    if (!this.initialized) {
      console.warn('⚠️ Firebase non initialisé, notifications push ignorées');
      return { success: false, error: 'Firebase non initialisé' };
    }

    if (!tokens || tokens.length === 0) {
      return { success: true, results: [] };
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#2196F3',
            sound: 'default',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        },
        tokens
      };

      const response = await this.messaging.sendMulticast(message);
      console.log(`✅ Notifications push envoyées: ${response.successCount}/${tokens.length}`);
      
      // Identifier les tokens invalides
      const invalidTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && 
              (resp.error.code === 'messaging/registration-token-not-registered' ||
               resp.error.code === 'messaging/invalid-registration-token')) {
            invalidTokens.push(tokens[idx]);
          }
        });
      }

      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
        responses: response.responses
      };

    } catch (error) {
      console.error('❌ Erreur envoi notifications push multiples:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie une notification à un topic
   * @param {string} topic - Nom du topic
   * @param {Object} notification - Données de notification
   * @param {Object} data - Données personnalisées (optionnel)
   */
  async sendToTopic(topic, notification, data = {}) {
    if (!this.initialized) {
      console.warn('⚠️ Firebase non initialisé, notification topic ignorée');
      return { success: false, error: 'Firebase non initialisé' };
    }

    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        }
      };

      const response = await this.messaging.send(message);
      console.log('✅ Notification topic envoyée:', response);
      return { success: true, messageId: response };

    } catch (error) {
      console.error('❌ Erreur envoi notification topic:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifie si Firebase est initialisé
   */
  isInitialized() {
    return this.initialized;
  }
}

// Instance singleton
const firebaseService = new FirebaseService();

module.exports = firebaseService;