// Script pour nettoyer complètement la base de données Aiven
require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données Aiven...\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 60000,
    multipleStatements: true
  };

  if (process.env.NODE_ENV === 'production') {
    config.ssl = { rejectUnauthorized: false };
  }

  try {
    console.log('🔄 Connexion à la base de données...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connecté!\n');

    // Désactiver les vérifications de clés étrangères
    console.log('🔄 Désactivation des contraintes de clés étrangères...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Récupérer toutes les tables
    console.log('🔄 Récupération de la liste des tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('✅ La base de données est déjà vide.');
      await connection.end();
      return;
    }

    console.log(`📋 ${tables.length} table(s) trouvée(s):\n`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n⚠️  ATTENTION: Toutes ces tables vont être supprimées!');
    console.log('⚠️  Cette action est IRRÉVERSIBLE!\n');

    // Supprimer toutes les tables
    console.log('🔄 Suppression des tables...');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`   Suppression de ${tableName}...`);
      await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    }

    // Réactiver les vérifications de clés étrangères
    console.log('\n🔄 Réactivation des contraintes de clés étrangères...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Vérifier que tout est supprimé
    const [remainingTables] = await connection.execute('SHOW TABLES');
    
    await connection.end();

    if (remainingTables.length === 0) {
      console.log('\n✅ Base de données nettoyée avec succès!');
      console.log('\n📝 Prochaines étapes:');
      console.log('   1. Redémarrez votre application Render');
      console.log('   2. Appelez: POST /api/init/reset');
      console.log('   3. Appelez: POST /api/init/seed');
      console.log('\nOu utilisez directement:');
      console.log('   curl -X POST https://votre-app.onrender.com/api/init/reset');
      console.log('   curl -X POST https://votre-app.onrender.com/api/init/seed');
    } else {
      console.log('\n⚠️  Attention: Certaines tables n\'ont pas été supprimées:');
      remainingTables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

// Demander confirmation avant de continuer
console.log('⚠️  ⚠️  ⚠️  AVERTISSEMENT ⚠️  ⚠️  ⚠️\n');
console.log('Ce script va SUPPRIMER TOUTES LES TABLES de votre base de données Aiven.');
console.log('Toutes les données seront PERDUES de manière IRRÉVERSIBLE!\n');
console.log('Base de données cible:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Database: ${process.env.DB_NAME}\n`);

// En production, demander une confirmation explicite
if (process.env.NODE_ENV === 'production') {
  console.log('Pour continuer, exécutez:');
  console.log('  CONFIRM_CLEAN=yes node clean-aiven-db.js\n');
  
  if (process.env.CONFIRM_CLEAN !== 'yes') {
    console.log('❌ Opération annulée (confirmation requise).');
    process.exit(0);
  }
}

console.log('Démarrage du nettoyage dans 3 secondes...\n');
setTimeout(cleanDatabase, 3000);
