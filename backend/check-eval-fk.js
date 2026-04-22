const db = require('./src/models');

db.sequelize.authenticate().then(async () => {
  // Check collation of classe table
  const [classeInfo] = await db.sequelize.query(
    'SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ("classe", "evaluationclasse")'
  );
  console.log('Table collations:', JSON.stringify(classeInfo, null, 2));

  // Check column collation
  const [colInfo] = await db.sequelize.query(
    'SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ("classe", "evaluationclasse") AND COLUMN_NAME IN ("id", "classe_id")'
  );
  console.log('Column collations:', JSON.stringify(colInfo, null, 2));

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
