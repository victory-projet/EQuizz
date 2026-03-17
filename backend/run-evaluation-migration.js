// Script pour exécuter la migration d'ajout de administrateur_id à Evaluation
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/database');

async function runMigration() {
  try {
    console.log('🔄 Exécution de la migration...\n');

    // Vérifier si la colonne existe déjà
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'equizz_db' 
      AND TABLE_NAME = 'Evaluation' 
      AND COLUMN_NAME = 'administrateur_id'
    `);

    if (results.length > 0) {
      console.log('✅ La colonne administrateur_id existe déjà dans la table Evaluation');
      process.exit(0);
    }

    console.log('📝 Ajout de la colonne administrateur_id...');
    
    await sequelize.query(`
      ALTER TABLE Evaluation 
      ADD COLUMN administrateur_id CHAR(36) NULL,
      ADD CONSTRAINT fk_evaluation_administrateur 
      FOREIGN KEY (administrateur_id) 
      REFERENCES administrateurs(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);

    console.log('✅ Colonne administrateur_id ajoutée avec succès!');
    console.log('');
    console.log('📊 Vérification...');
    
    const [verification] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'equizz_db' 
      AND TABLE_NAME = 'Evaluation' 
      AND COLUMN_NAME = 'administrateur_id'
    `);

    console.log('   Colonne:', verification[0].COLUMN_NAME);
    console.log('   Type:', verification[0].DATA_TYPE);
    console.log('   Nullable:', verification[0].IS_NULLABLE);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();
