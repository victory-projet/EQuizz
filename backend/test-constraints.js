const sequelize = require('./src/config/database');

async function checkConstraints() {
  try {
    console.log('🔍 Vérification des contraintes...');
    
    // Vérifier les contraintes de la table anneeacademique
    console.log('\n📋 Contraintes de la table anneeacademique:');
    const [constraints] = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        CONSTRAINT_TYPE,
        COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'equizz_db' 
      AND TABLE_NAME = 'anneeacademique'
    `);
    
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.CONSTRAINT_NAME}: ${constraint.CONSTRAINT_TYPE} sur ${constraint.COLUMN_NAME}`);
    });
    
    // Vérifier les index
    console.log('\n📋 Index de la table anneeacademique:');
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM anneeacademique
    `);
    
    indexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? 'non-unique' : 'unique'})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkConstraints();