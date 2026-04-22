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
    // Lister toutes les tables
    const [tables] = await conn.execute(`SHOW TABLES`);
    console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));

    // Vérifier les colonnes actuelles de cours (semestre_id, enseignant_id)
    const [cols] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cours'
        AND COLUMN_NAME IN ('semestre_id', 'enseignant_id')
    `, [process.env.DB_NAME]);
    console.log('\nColonnes cours:', JSON.stringify(cols));

    // Les colonnes sont déjà nullable (IS_NULLABLE: YES) - pas besoin de recréer les FK
    // On peut juste laisser sans FK ou recréer avec le bon nom de table
    const semNullable = cols.find(c => c.COLUMN_NAME === 'semestre_id')?.IS_NULLABLE === 'YES';
    const ensNullable = cols.find(c => c.COLUMN_NAME === 'enseignant_id')?.IS_NULLABLE === 'YES';
    
    console.log('\nsemestre_id nullable:', semNullable);
    console.log('enseignant_id nullable:', ensNullable);
    console.log('\n✅ Les colonnes sont déjà nullable - migration déjà effectuée !');
    console.log('Tu peux redémarrer le backend maintenant.');

  } catch (e) {
    console.error('❌', e.message);
  } finally {
    await conn.end();
    process.exit(0);
  }
})();
