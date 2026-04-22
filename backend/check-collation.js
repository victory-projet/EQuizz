const db = require('./src/models');

async function checkCollation() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check administrateurs.id
    const adminIdQuery = `
      SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'administrateurs'
        AND COLUMN_NAME = 'id'
    `;

    const adminId = await db.sequelize.query(adminIdQuery, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('administrateurs.id:');
    console.log(JSON.stringify(adminId, null, 2));
    console.log('');

    // Check evaluations.administrateur_id
    const evalAdminIdQuery = `
      SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluations'
        AND COLUMN_NAME = 'administrateur_id'
    `;

    const evalAdminId = await db.sequelize.query(evalAdminIdQuery, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('evaluations.administrateur_id:');
    console.log(JSON.stringify(evalAdminId, null, 2));
    console.log('');

    // Check superadministrateurs.id
    const superAdminIdQuery = `
      SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'superadministrateurs'
        AND COLUMN_NAME = 'id'
    `;

    const superAdminId = await db.sequelize.query(superAdminIdQuery, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('superadministrateurs.id:');
    console.log(JSON.stringify(superAdminId, null, 2));
    console.log('');

    // Check evaluations.superadministrateur_id
    const evalSuperAdminIdQuery = `
      SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluations'
        AND COLUMN_NAME = 'superadministrateur_id'
    `;

    const evalSuperAdminId = await db.sequelize.query(evalSuperAdminIdQuery, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('evaluations.superadministrateur_id:');
    console.log(JSON.stringify(evalSuperAdminId, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCollation();
