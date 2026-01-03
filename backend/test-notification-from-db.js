// backend/test-notification-from-db.js

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
    rejectUnauthorized: false // Pour Aiven Cloud
  }
};

async function testNotificationFromDB() {
  let connection = null;
  
  try {
    console.log('�  Connexion à la base de données MySQL en ligne...');
    console.log('📍 Host:', dbConfig.host);
    console.log('🔢 Port:', dbConfig.port);
    console.log('👤 User:', dbConfig.user);
    
    // Connexion à MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL établie');
    
    // Lister les tables disponibles
    console.log('\n📋 Tables disponibles:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log('  -', tableName);
    });
    
    // Chercher la table des tokens (plusieurs noms possibles)
    const tokenTableNames = ['DeviceTokens', 'device_tokens', 'devicetokens', 'tokens'];
    let tokenTable = null;
    
    for (const tableName of tokenTableNames) {
      try {
        const [result] = await connection.execute(`DESCRIBE ${tableName}`);
        if (result.length > 0) {
          tokenTable = tableName;
          console.log(`\n✅ Table des tokens trouvée: ${tableName}`);
          break;
        }
      } catch (err) {
        // Table n'existe pas, continuer
      }
    }
    
    if (!tokenTable) {
      console.log('\n❌ Table des tokens non trouvée. Recherche manuelle...');
      // Chercher dans toutes les tables
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        try {
          const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
          const hasToken = columns.some(col => 
            col.Field.toLowerCase().includes('token') || 
            col.Field.toLowerCase().includes('device')
          );
          if (hasToken) {
            console.log(`🔍 Table potentielle trouvée: ${tableName}`);
            console.log('   Colonnes:', columns.map(c => c.Field).join(', '));
          }
        } catch (err) {
          // Ignorer les erreurs
        }
      }
      return;
    }
    
    // Examiner la structure de la table des tokens
    console.log(`\n�  Structure de la table ${tokenTable}:`);
    const [columns] = await connection.execute(`DESCRIBE ${tokenTable}`);
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Récupérer les tokens actifs
    console.log(`\n🔍 Récupération des tokens actifs...`);
    const [tokens] = await connection.execute(`
      SELECT * FROM ${tokenTable} 
      WHERE isActive = 1 OR isActive = true
      ORDER BY lastUsed DESC 
      LIMIT 5
    `);
    
    console.log(`📱 ${tokens.length} token(s) actif(s) trouvé(s):`);
    tokens.forEach((token, index) => {
      console.log(`\n  Token ${index + 1}:`);
      console.log(`    - ID: ${token.id || 'N/A'}`);
      console.log(`    - Utilisateur: ${token.utilisateur_id || token.user_id || 'N/A'}`);
      console.log(`    - Token: ${token.token ? token.token.substring(0, 30) + '...' : 'N/A'}`);
      console.log(`    - Platform: ${token.platform || 'N/A'}`);
      console.log(`    - Dernière utilisation: ${token.lastUsed || token.last_used || 'N/A'}`);
      console.log(`    - Actif: ${token.isActive || token.is_active || 'N/A'}`);
    });
    
    if (tokens.length === 0) {
      console.log('\n⚠️ Aucun token actif trouvé. Vérification de tous les tokens...');
      const [allTokens] = await connection.execute(`SELECT * FROM ${tokenTable} LIMIT 5`);
      console.log(`📱 ${allTokens.length} token(s) total(aux):`);
      allTokens.forEach((token, index) => {
        console.log(`  Token ${index + 1}: ${token.token ? token.token.substring(0, 30) + '...' : 'N/A'} (actif: ${token.isActive || token.is_active})`);
      });
    }
    
    // Test avec le premier token trouvé
    if (tokens.length > 0 && tokens[0].token) {
      console.log('\n🚀 Test de notification avec le premier token...');
      
      // Initialiser Firebase
      const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
      const serviceAccount = require(serviceAccountPath);
      
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      const messaging = admin.messaging(app);
      
      const message = {
        notification: {
          title: '🎉 Test EQuizz DB',
          body: 'Notification de test depuis la base de données !'
        },
        data: {
          type: 'test_db',
          timestamp: Date.now().toString()
        },
        token: tokens[0].token,
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
      } catch (sendError) {
        console.log('❌ Erreur lors de l\'envoi:', sendError.code, sendError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Problème de réseau ou d\'adresse du serveur');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔐 Problème d\'authentification MySQL');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion MySQL fermée');
    }
  }
}

testNotificationFromDB();