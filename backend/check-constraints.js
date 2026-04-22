const db = require('./src/models');

async function checkConstraints() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const query = `
      SELECT 
        rc.CONSTRAINT_NAME,
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM information_schema.REFERENTIAL_CONSTRAINTS rc
      JOIN information_schema.KEY_COLUMN_USAGE kcu
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
      WHERE rc.CONSTRAINT_SCHEMA = 'equizz_db'
        AND rc.TABLE_NAME = 'evaluations'
    `;

    const constraints = await db.sequelize.query(query, { 
      type: db.sequelize.QueryTypes.SELECT 
    });

    console.log('Foreign key constraints on evaluations:');
    console.log(JSON.stringify(constraints, null, 2));

    // Try to drop and recreate the problematic constraint
    console.log('\n🔧 Attempting to drop and recreate evaluations_ibfk_2...');
    
    try {
      await db.sequelize.query('ALTER TABLE evaluations DROP FOREIGN KEY evaluations_ibfk_2');
      console.log('✅ Dropped evaluations_ibfk_2');
      
      await db.sequelize.query(`
        ALTER TABLE evaluations 
        ADD CONSTRAINT evaluations_ibfk_2 
        FOREIGN KEY (administrateur_id) 
        REFERENCES administrateurs(id)
      `);
      console.log('✅ Recreated evaluations_ibfk_2');
    } catch (error) {
      console.error('❌ Error recreating constraint:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkConstraints();
