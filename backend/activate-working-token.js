// backend/activate-working-token.js

const mysql = require('mysql2/promise');

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

async function activateWorkingToken() {
  let connection = null;
  
  try {
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // Activer le token qui fonctionne
    const workingToken = 'eghpjFtnRdumZ2_sIb_ba7:APA91bHqFN7f4-grqQUNIBrbrfS';
    
    console.log('🔄 Activation du token qui fonctionne...');
    const [result] = await connection.execute(`
      UPDATE DeviceToken 
      SET is_active = 1, last_used = NOW() 
      WHERE token LIKE ?
    `, [workingToken + '%']);
    
    console.log(`✅ ${result.affectedRows} token(s) activé(s)`);
    
    // Vérifier les tokens actifs maintenant
    const [activeTokens] = await connection.execute(`
      SELECT id, utilisateur_id, token, platform, is_active, last_used 
      FROM DeviceToken 
      WHERE is_active = 1 AND deleted_at IS NULL
    `);
    
    console.log(`\n📱 ${activeTokens.length} token(s) actif(s) maintenant:`);
    activeTokens.forEach((token, index) => {
      console.log(`  ${index + 1}. User: ${token.utilisateur_id}, Platform: ${token.platform}`);
      console.log(`     Token: ${token.token.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

activateWorkingToken();