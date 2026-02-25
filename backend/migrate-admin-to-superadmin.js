const db = require('./src/models');

async function migrateData() {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🔄 Migration des données administrateur -> superadministrateur...\n');
    
    // 1. Vérifier les données existantes
    const [adminData] = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM administrateur',
      { transaction }
    );
    console.log(`📊 Enregistrements dans administrateur: ${adminData[0].count}`);
    
    const [superAdminData] = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM superadministrateur',
      { transaction }
    );
    console.log(`📊 Enregistrements dans superadministrateur: ${superAdminData[0].count}`);
    
    if (adminData[0].count === 0) {
      console.log('\n✅ Aucune donnée à migrer.');
      await transaction.commit();
      process.exit(0);
    }
    
    // 2. Vérifier si les données ont déjà été copiées
    if (superAdminData[0].count > 0) {
      console.log('\n⚠️  Les données ont déjà été copiées. Passage à l\'étape suivante...');
    } else {
      // Copier les données
      console.log('\n📋 Copie des données...');
      await db.sequelize.query(
        `INSERT INTO superadministrateur (id, profil, created_at, updated_at, deleted_at)
         SELECT id, profil, created_at, updated_at, deleted_at
         FROM administrateur`,
        { transaction }
      );
      
      // Vérifier la copie
      const [newSuperAdminData] = await db.sequelize.query(
        'SELECT COUNT(*) as count FROM superadministrateur',
        { transaction }
      );
      console.log(`✅ ${newSuperAdminData[0].count} enregistrements copiés dans superadministrateur`);
    }
    
    // 4. Mettre à jour les clés étrangères dans la table evaluation
    console.log('\n🔗 Mise à jour des clés étrangères dans evaluation...');
    
    // Vérifier quelle colonne existe (administrateur_id ou superadministrateur_id)
    const [evalColumns] = await db.sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND COLUMN_NAME IN ('administrateur_id', 'superadministrateur_id')
    `, { transaction });
    
    const columnName = evalColumns[0]?.COLUMN_NAME;
    
    if (!columnName) {
      console.log('❌ Aucune colonne administrateur trouvée dans evaluation');
      await transaction.rollback();
      process.exit(1);
    }
    
    console.log(`📊 Colonne trouvée: ${columnName}`);
    
    if (columnName === 'superadministrateur_id') {
      console.log('✅ La colonne a déjà été renommée. Vérification de la collation...');
      
      // Vérifier la collation actuelle
      const [colInfo] = await db.sequelize.query(`
        SELECT COLLATION_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'equizz_db'
          AND TABLE_NAME = 'evaluation'
          AND COLUMN_NAME = 'superadministrateur_id'
      `, { transaction });
      
      if (colInfo[0].COLLATION_NAME !== 'utf8mb4_bin') {
        console.log(`🔧 Correction de la collation (${colInfo[0].COLLATION_NAME} -> utf8mb4_bin)...`);
        await db.sequelize.query(
          'ALTER TABLE evaluation MODIFY superadministrateur_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
          { transaction }
        );
        console.log('✅ Collation corrigée');
      } else {
        console.log('✅ La collation est correcte');
      }
      
      // Vérifier si la contrainte existe déjà
      const [existingConstraint] = await db.sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'equizz_db'
          AND TABLE_NAME = 'evaluation'
          AND COLUMN_NAME = 'superadministrateur_id'
          AND REFERENCED_TABLE_NAME = 'superadministrateur'
      `, { transaction });
      
      if (existingConstraint.length > 0) {
        console.log('✅ La contrainte existe déjà. Migration déjà effectuée.');
      } else {
        console.log('🔗 Création de la contrainte de clé étrangère...');
        await db.sequelize.query(
          `ALTER TABLE evaluation 
           ADD CONSTRAINT evaluation_superadministrateur_fk 
           FOREIGN KEY (superadministrateur_id) 
           REFERENCES superadministrateur(id) 
           ON DELETE RESTRICT ON UPDATE CASCADE`,
          { transaction }
        );
        console.log('✅ Contrainte de clé étrangère créée');
      }
    } else {
      // La colonne s'appelle encore administrateur_id, on doit la renommer
      const [evalCount] = await db.sequelize.query(
        `SELECT COUNT(*) as count FROM evaluation WHERE ${columnName} IS NOT NULL`,
        { transaction }
      );
      console.log(`📊 ${evalCount[0].count} évaluations à mettre à jour`);
      
      // Récupérer toutes les contraintes liées à administrateur_id
      const [constraints] = await db.sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'equizz_db'
          AND TABLE_NAME = 'evaluation'
          AND COLUMN_NAME = 'administrateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, { transaction });
      
      // Supprimer toutes les contraintes de clé étrangère liées à administrateur_id
      console.log('🔓 Suppression des contraintes de clé étrangère...');
      for (const constraint of constraints) {
        console.log(`   Suppression de ${constraint.CONSTRAINT_NAME}...`);
        await db.sequelize.query(
          `ALTER TABLE evaluation DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`,
          { transaction }
        );
      }
      
      // Renommer la colonne administrateur_id en superadministrateur_id
      await db.sequelize.query(
        'ALTER TABLE evaluation CHANGE administrateur_id superadministrateur_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
        { transaction }
      );
      console.log('✅ Colonne renommée: administrateur_id -> superadministrateur_id');
      
      // Recréer la contrainte de clé étrangère avec la nouvelle table
      console.log('🔗 Recréation de la contrainte de clé étrangère...');
      await db.sequelize.query(
        `ALTER TABLE evaluation 
         ADD CONSTRAINT evaluation_superadministrateur_fk 
         FOREIGN KEY (superadministrateur_id) 
         REFERENCES superadministrateur(id) 
         ON DELETE RESTRICT ON UPDATE CASCADE`,
        { transaction }
      );
      console.log('✅ Contrainte de clé étrangère recréée');
    }
    
    // 5. Supprimer l'ancienne table administrateur
    console.log('\n🗑️  Suppression de l\'ancienne table administrateur...');
    await db.sequelize.query('DROP TABLE administrateur', { transaction });
    console.log('✅ Table administrateur supprimée');
    
    await transaction.commit();
    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n📝 Résumé:');
    console.log(`   - ${adminData[0].count} administrateurs migrés vers superadministrateurs`);
    console.log(`   - ${evalCount[0].count} évaluations mises à jour`);
    console.log('   - Table administrateur supprimée');
    
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateData();
