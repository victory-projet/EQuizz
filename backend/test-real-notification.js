// backend/test-real-notification.js

const admin = require('firebase-admin');
const path = require('path');

async function testRealNotification() {
  try {
    console.log('🔧 Test avec un vrai token...');
    
    // Initialiser Firebase
    const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    const messaging = admin.messaging(app);
    
    // Token réel de votre mobile (remplacez par le token complet)
    const realToken = 'eghpjFtnRdumZ2_sIb_ba7:APA91bH...'; // Remplacez par le token complet
    
    const message = {
      notification: {
        title: '🎉 Test EQuizz',
        body: 'Notification de test depuis le serveur !'
      },
      data: {
        type: 'test',
        timestamp: Date.now().toString()
      },
      token: realToken,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2196F3',
          sound: 'default',
          priority: 'high'
        }
      }
    };
    
    console.log('🚀 Envoi de notification de test...');
    
    try {
      const response = await messaging.send(message);
      console.log('✅ Notification envoyée avec succès !');
      console.log('📱 Message ID:', response);
      console.log('🎯 Vérifiez votre téléphone !');
    } catch (sendError) {
      console.log('❌ Erreur lors de l\'envoi:', sendError.code, sendError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testRealNotification();