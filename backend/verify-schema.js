// Script pour vérifier le schéma de la base de données
const db = require('./src/models');

async function verifySchema() {
  try {
    console.log('🔍 Vérification du schéma de la base de données...\n');
    
    // 1. Vérifier les tables
    const [tables] = await db.sequelize.query('SHOW TABLES');
    console.log(`✅ ${tables.length} tables trouvées\n`);
    
    // 2. Vérifier la structure de administrateurs
    const [adminCols] = await db.sequelize.query('DESCRIBE administrateurs');
    console.log('📋 Structure de la table administrateurs:');
    adminCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 3. Vérifier les contraintes FK
    const [fks] = await db.sequelize.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'equizz_db' 
        AND TABLE_NAME = 'administrateurs' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n🔗 Contraintes de clés étrangères:');
    fks.forEach(fk => {
      console.log(`  - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
    
    // 4. Compter les utilisateurs
    const userCount = await db.Utilisateur.count();
    console.log(`\n👥 Utilisateurs dans la base: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  Base de données vide - le seeding devrait se déclencher au prochain démarrage');
    } else {
      console.log('✅ Base de données initialisée');
    }
    
    console.log('\n✅ Vérification terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

verifySchema();
