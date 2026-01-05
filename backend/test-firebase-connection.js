// backend/test-firebase-connection.js

const admin = require('firebase-admin');
const path = require('path');

async function testFirebaseConnection() {
  try {
    console.log('🔧 Test de connexion Firebase...');
    
    // Initialiser Firebase
    const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    console.log('📋 Configuration Firebase:');
    console.log('   - Project ID:', serviceAccount.project_id);
    console.log('   - Client Email:', serviceAccount.client_email);
    console.log('   - Private Key ID:', serviceAccount.private_key_id);
    
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('✅ Firebase initialisé avec succès');
    
    // Tester l'accès à Messaging
    const messaging = admin.messaging(app);
    console.log('✅ Service Messaging accessible');
    
    // Test avec un token invalide pour voir la réponse
    const invalidToken = 'invalid-token-for-testing';
    
    const message = {
      notification: {
        title: 'Test Firebase',
        body: 'Test de connexion Firebase'
      },
      token: invalidToken
    };
    
    console.log('🚀 Test avec token invalide (pour diagnostic)...');
    
    try {
      const response = await messaging.send(message);
      console.log('✅ Réponse inattendue (token invalide devrait échouer):', response);
    } catch (sendError) {
      console.log('📋 Erreur attendue avec token invalide:');
      console.log('   - Code:', sendError.code);
      console.log('   - Message:', sendError.message);
      
      // Vérifier le type d'erreur
      if (sendError.code === 'messaging/invalid-registration-token') {
        console.log('✅ Service Firebase fonctionne parfaitement !');
        console.log('🎉 Le problème était probablement temporaire ou lié à la méthode sendMulticast');
        
        // Test avec un vrai token si disponible
        console.log('\n🔍 Pour tester avec un vrai token, utilisez le token de votre app mobile:');
        console.log('   eghpjFtnRdumZ2_sIb_ba7:APA91bH...');
        
      } else if (sendError.message.includes('404')) {
        console.log('❌ Erreur 404: Problème de configuration ou projet inexistant');
      } else {
        console.log('❓ Erreur inattendue:', sendError.message);
      }
    }
    
    // Test avec sendEach (méthode alternative)
    console.log('\n🔄 Test avec sendEach (méthode alternative)...');
    try {
      const messages = [{
        notification: {
          title: 'Test sendEach',
          body: 'Test avec sendEach'
        },
        token: invalidToken
      }];
      
      const batchResponse = await messaging.sendEach(messages);
      console.log('📊 Réponse sendEach:', {
        successCount: batchResponse.successCount,
        failureCount: batchResponse.failureCount
      });
      
      if (batchResponse.responses[0] && !batchResponse.responses[0].success) {
        const error = batchResponse.responses[0].error;
        if (error.code === 'messaging/invalid-registration-token') {
          console.log('✅ sendEach fonctionne aussi !');
        }
      }
      
    } catch (batchError) {
      console.log('❌ Erreur avec sendEach:', batchError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testFirebaseConnection();