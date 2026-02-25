// Script pour exécuter la migration Administrateur
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');

async function runMigration() {
  const sequelize = config;
  
  try {
    console.log('🔄 Exécution de la migration Administrateur...\n');

    // Vérifier si la table existe déjà
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'Administrateurs'
    `);

    if (results[0].count > 0) {
      console.log('⚠️  La table Administrateurs existe déjà.');
      console.log('   Voulez-vous la recréer? (Cela supprimera toutes les données)');
      process.exit(0);
    }

    // Créer la table
    await sequelize.query(`
      CREATE TABLE Administrateurs (
        id CHAR(36) PRIMARY KEY,
        ecole_id CHAR(36) NOT NULL,
        date_nomination DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_administrateurs_ecole_id (ecole_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
      COMMENT='Table des administrateurs d\\'école';
    `);
    console.log('✅ Table Administrateurs créée');

    // Ajouter les contraintes de clés étrangères après la création
    try {
      await sequelize.query(`
        ALTER TABLE Administrateurs
        ADD CONSTRAINT fk_administrateur_utilisateur 
          FOREIGN KEY (id) REFERENCES Utilisateurs(id) ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✅ Contrainte FK vers Utilisateurs ajoutée');
    } catch (error) {
      console.log('⚠️  Contrainte FK vers Utilisateurs:', error.message);
    }

    try {
      await sequelize.query(`
        ALTER TABLE Administrateurs
        ADD CONSTRAINT fk_administrateur_ecole 
          FOREIGN KEY (ecole_id) REFERENCES Ecoles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
      console.log('✅ Contrainte FK vers Ecoles ajoutée');
    } catch (error) {
      console.log('⚠️  Contrainte FK vers Ecoles:', error.message);
    }

    console.log('\n✅ Migration terminée avec succès!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();
