const db = require('./src/models');

async function fixForeignKeys() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    // Désactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Vérifications de clés étrangères désactivées\n');

    // Supprimer les anciennes contraintes sur evaluation
    console.log('🔧 Suppression des anciennes contraintes...');
    try {
      await db.sequelize.query('ALTER TABLE evaluation DROP FOREIGN KEY IF EXISTS evaluations_ibfk_1');
      await db.sequelize.query('ALTER TABLE evaluation DROP FOREIGN KEY IF EXISTS evaluations_ibfk_2');
      await db.sequelize.query('ALTER TABLE evaluation DROP FOREIGN KEY IF EXISTS evaluations_ibfk_3');
      console.log('✅ Anciennes contraintes supprimées\n');
    } catch (error) {
      console.log('ℹ️  Certaines contraintes n\'existaient pas\n');
    }

    // Recréer les contraintes avec les bons noms de tables
    console.log('🔧 Création des nouvelles contraintes...');
    
    await db.sequelize.query(`
      ALTER TABLE evaluation 
      ADD CONSTRAINT evaluation_superadmin_fk 
      FOREIGN KEY (superadministrateur_id) 
      REFERENCES superadministrateur(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
    console.log('✅ Contrainte evaluation -> superadministrateur créée');

    await db.sequelize.query(`
      ALTER TABLE evaluation 
      ADD CONSTRAINT evaluation_admin_fk 
      FOREIGN KEY (administrateur_id) 
      REFERENCES administrateur(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
    console.log('✅ Contrainte evaluation -> administrateur créée');

    await db.sequelize.query(`
      ALTER TABLE evaluation 
      ADD CONSTRAINT evaluation_cours_fk 
      FOREIGN KEY (cours_id) 
      REFERENCES cours(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
    console.log('✅ Contrainte evaluation -> cours créée');

    // Réactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Vérifications de clés étrangères réactivées');

    console.log('\n✅ Toutes les contraintes ont été mises à jour!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixForeignKeys();
