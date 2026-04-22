const { Sequelize } = require('sequelize');
require('dotenv').config();

async function renameTables() {
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
    console.log('🔄 Renommage des tables...\n');

    // Renommer administrateurs -> Administrateur
    console.log('1️⃣ Renommage administrateurs -> Administrateur');
    await sequelize.query('RENAME TABLE administrateurs TO Administrateur');
    console.log('✅ Table administrateurs renommée\n');

    // Vérifier si superadministrateurs existe et la renommer
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME}'
        AND TABLE_NAME = 'superadministrateurs'
    `);

    if (tables.length > 0) {
      console.log('2️⃣ Renommage superadministrateurs -> Superadministrateur');
      await sequelize.query('RENAME TABLE superadministrateurs TO Superadministrateur');
      console.log('✅ Table superadministrateurs renommée\n');
    }

    console.log('✅ Toutes les tables ont été renommées avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

renameTables();
