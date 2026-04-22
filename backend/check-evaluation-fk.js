const db = require('./src/models');

async function checkForeignKeys() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const query = `
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'equizz_db' 
        AND TABLE_NAME = 'evaluations'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `;

    const foreignKeys = await db.sequelize.query(query, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('Foreign keys on evaluations table:');
    console.log(JSON.stringify(foreignKeys, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkForeignKeys();
