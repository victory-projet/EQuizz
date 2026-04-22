const db = require('./src/models');

db.sequelize.authenticate().then(async () => {
  // Test: try to insert directly into evaluationclasse with known IDs
  const classeId = '6d86e13b-68f9-452e-98bf-f0aa8d4c0b39';
  
  // First check if classe exists
  const classe = await db.Classe.findByPk(classeId);
  console.log('Classe found:', classe ? classe.nom : 'NOT FOUND');

  // Check the Evaluation <-> Classe association
  console.log('Evaluation associations:', Object.keys(db.Evaluation.associations));
  
  // Check what addClasses expects
  const assoc = db.Evaluation.associations;
  console.log('Association details:', JSON.stringify(
    Object.entries(assoc).map(([k, v]) => ({ 
      key: k, 
      type: v.associationType,
      foreignKey: v.foreignKey,
      otherKey: v.otherKey,
      through: v.through?.model?.tableName || v.through?.tableName
    })), null, 2
  ));

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
