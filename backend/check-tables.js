const db = require('./src/models');

async function checkTables() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check administrateur table structure
    const adminCols = await db.sequelize.query('DESCRIBE administrateur', { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('administrateur table structure:');
    console.log(JSON.stringify(adminCols, null, 2));
    console.log('');

    // Check ecole table structure
    const ecoleCols = await db.sequelize.query('DESCRIBE ecole', { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('ecole table structure:');
    console.log(JSON.stringify(ecoleCols, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
