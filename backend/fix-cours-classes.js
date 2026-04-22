require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Vérifier si la colonne existe déjà
    const [cols] = await conn.execute(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cours_classes'
    `, [process.env.DB_NAME]);
    
    const colNames = cols.map(c => c.COLUMN_NAME);
    console.log('Colonnes cours_classes:', colNames.join(', '));

    if (!colNames.includes('annee_academique_id')) {
      await conn.execute(`
        ALTER TABLE cours_classes 
        ADD COLUMN annee_academique_id CHAR(36) NULL DEFAULT NULL
      `);
      console.log('✅ Colonne annee_academique_id ajoutée à cours_classes');
    } else {
      console.log('ℹ️  Colonne annee_academique_id déjà présente');
    }

  } catch (e) {
    console.error('❌', e.message);
  } finally {
    await conn.end();
    process.exit(0);
  }
})();
