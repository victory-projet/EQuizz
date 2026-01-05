// backend/test-notification-from-db-v2.js

const mysql = require('mysql2/promise');
const admin = require('firebase-admin');
const path = require('path');

// Configuration de la base de données en ligne
const dbConfig = {
  host: 'equizz-mysql-gillsimo08-1c72.e.aivencloud.com',
  port: 20530,
  user: 'avnadmin',
  password: 'AVNS_Xad0cJehM399ZU9M9Zu',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
};

async function testNotificationFromDB() {
  let connection = null;
  
  try {
    console.log('🔌 Connexion à la base de données MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL établie');
    
    // Examiner la structure de la table DeviceToken
    console.log('\n📊 Structure de la table DeviceToken:');
    const [columns] = await connection.execute('DESCRIBE DeviceToken');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Récupérer les tokens actifs
    console.log('\n🔍 Récupération des tokens actifs...');
    const [tokens] = await connection.execute(`
      SELECT * FROM DeviceToken 
      WHERE is_active = 1 AND deleted_at IS NULL
      ORDER BY last_used DESC 
      LIMIT 5
    `);
    
    console.log(`📱 ${tokens.length} token(s) actif(s) trouvé(s):`);
    tokens.forEach((token, index) => {
      console.log(`\n  Token ${index + 1}:`);
      console.log(`    - ID: ${token.id}`);
      console.log(`    - Utilisateur: ${token.utilisateur_id}`);
      console.log(`    - Token: ${token.token.substring(0, 50)}...`);
      console.log(`    - Platform: ${token.platform}`);
      console.log(`    - Device ID: ${token.device_id || 'N/A'}`);
      console.log(`    - Dernière utilisation: ${token.last_used}`);
      console.log(`    - Créé le: ${token.created_at}`);
    });
    
    if (tokens.length === 0) {
      console.log('\n⚠️ Aucun token actif. Récupération de tous les tokens...');
      const [allTokens] = await connection.execute(`
        SELECT * FROM DeviceToken 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.log(`📱 ${allTokens.length} token(s) total(aux):`);
      allTokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: ${token.token.substring(0, 50)}... (actif: ${token.is_active})`);
      });
      
      if (allTokens.length > 0) {
        tokens.push(allTokens[0]);
        console.log('\n🔄 Test avec le premier token disponible...');
      }
    }
    
    // Test Firebase avec le premier token
    if (tokens.length > 0 && tokens[0].token) {
      console.log('\n🚀 Initialisation Firebase...');
      
      const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
      const serviceAccount = require(serviceAccountPath);
      
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      const messaging = admin.messaging(app);
      
      const testToken = tokens[0].token;
      console.log(`📱 Test avec token: ${testToken.substring(0, 50)}...`);
      
      const message = {
        notification: {
          title: '🎉 Test EQuizz DB',
          body: 'Notification depuis la base de données en ligne !'
        },
        data: {
          type: 'test_db',
          timestamp: Date.now().toString(),
          user_id: tokens[0].utilisateur_id.toString()
        },
        token: testToken,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#2196F3',
            sound: 'default',
            priority: 'high'
          }
        }
      };
      
      try {
        const response = await messaging.send(message);
        console.log('✅ Notification envoyée avec succès !');
        console.log('📱 Message ID:', response);
        console.log('🎯 Vérifiez votre téléphone !');
        
        // Mettre à jour last_used dans la DB
        await connection.execute(`
          UPDATE DeviceToken 
          SET last_used = NOW() 
          WHERE id = ?
        `, [tokens[0].id]);
        console.log('📝 Timestamp mis à jour dans la DB');
        
      } catch (sendError) {
        console.log('❌ Erreur lors de l\'envoi:', sendError.code);
        console.log('   Message:', sendError.message);
        
        if (sendError.code === 'messaging/invalid-registration-token') {
          console.log('🔄 Token invalide, marquage comme inactif...');
          await connection.execute(`
            UPDATE DeviceToken 
            SET is_active = 0 
            WHERE id = ?
          `, [tokens[0].id]);
        }
      }
    } else {
      console.log('\n❌ Aucun token disponible pour le test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

testNotificationFromDB();