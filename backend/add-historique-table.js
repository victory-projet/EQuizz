// backend/add-historique-table.js
// Script simple pour ajouter la table HistoriqueEtudiant

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.error('❌ Fichier .env non trouvé !');
  console.log('💡 Créez un fichier .env avec vos paramètres de base de données');
  process.exit(1);
}

const db = require('./src/models');

async function addHistoriqueTable() {
  console.log('🚀 Ajout de la table HistoriqueEtudiant à la base de données\n');

  try {
    // 1. Tester la connexion
    console.log('1️⃣  Test de connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('   ✅ Connexion réussie\n');

    // 2. Vérifier si la table existe déjà
    console.log('2️⃣  Vérification de l\'existence de la table...');
    const [results] = await db.sequelize.query(
      "SHOW TABLES LIKE 'HistoriqueEtudiant'"
    );

    if (results.length > 0) {
      console.log('   ⚠️  La table HistoriqueEtudiant existe déjà !');
      console.log('   ℹ️  Rien à faire.\n');
      
      // Afficher la structure
      console.log('3️⃣  Structure de la table existante :');
      const [structure] = await db.sequelize.query(
        "DESCRIBE HistoriqueEtudiant"
      );
      console.table(structure);
      
    } else {
      console.log('   ℹ️  La table n\'existe pas encore\n');

      // 3. Créer la table
      console.log('3️⃣  Création de la table HistoriqueEtudiant...');
      await db.HistoriqueEtudiant.sync({ force: false });
      console.log('   ✅ Table créée avec succès\n');

      // 4. Vérifier la création
      console.log('4️⃣  Vérification de la création...');
      const [newStructure] = await db.sequelize.query(
        "DESCRIBE HistoriqueEtudiant"
      );
      console.table(newStructure);

      // 5. Vérifier les index
      console.log('\n5️⃣  Vérification des index...');
      const [indexes] = await db.sequelize.query(
        "SHOW INDEX FROM HistoriqueEtudiant"
      );
      console.log(`   ✅ ${indexes.length} index créés\n`);
    }

    console.log('✅ OPÉRATION TERMINÉE AVEC SUCCÈS ! 🎉\n');
    console.log('📋 Prochaines étapes :');
    console.log('   1. Démarrez le backend : npm start');
    console.log('   2. Testez la création d\'un étudiant');
    console.log('   3. Testez un transfert d\'école');
    console.log('   4. Consultez l\'historique\n');

  } catch (error) {
    console.error('\n❌ ERREUR :', error.message);
    console.error('\n💡 Solutions possibles :');
    console.error('   1. Vérifiez que MySQL est démarré');
    console.error('   2. Vérifiez les credentials dans .env');
    console.error('   3. Vérifiez que la base de données existe');
    console.error('   4. Créez la base : CREATE DATABASE equizz_db;\n');
    
    if (error.parent) {
      console.error('Détails de l\'erreur :', error.parent.message);
    }
  } finally {
    // Fermer la connexion
    await db.sequelize.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
addHistoriqueTable();
