const { Sequelize } = require('sequelize');
require('dotenv').config();

async function runMigration() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT,
      logging: console.log
    }
  );

  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connecté\n');

    console.log('🔄 Ajout de la colonne est_active à la table Ecole...');
    await sequelize.query(`
      ALTER TABLE Ecole 
      ADD COLUMN est_active BOOLEAN NOT NULL DEFAULT TRUE 
      COMMENT 'Indique si l\\'école est active dans le système'
    `);
    console.log('✅ Colonne est_active ajoutée avec succès!\n');

    console.log('📊 Vérification de la colonne...');
    const [results] = await sequelize.query('DESCRIBE Ecole');
    const estActiveColumn = results.find(col => col.Field === 'est_active');
    
    if (estActiveColumn) {
      console.log('✅ Colonne est_active trouvée:');
      console.log('   Type:', estActiveColumn.Type);
      console.log('   Null:', estActiveColumn.Null);
      console.log('   Default:', estActiveColumn.Default);
    } else {
      console.log('❌ Colonne est_active non trouvée!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  La colonne existe déjà, aucune action nécessaire.');
    }
  } finally {
    await sequelize.close();
  }
}

runMigration();
