// Vérification finale complète
const db = require('./src/models');

async function finalCheck() {
  try {
    console.log('🔍 VÉRIFICATION FINALE DU SYSTÈME\n');
    console.log('='.repeat(50) + '\n');

    // 1. Connexion DB
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données: OK\n');

    // 2. Tables
    const [tables] = await db.sequelize.query('SHOW TABLES');
    console.log(`✅ Tables créées: ${tables.length} tables\n`);

    // 3. Utilisateurs
    const users = await db.Utilisateur.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'estActif']
    });
    console.log(`👥 Utilisateurs: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.prenom} ${u.nom} (${u.email})`);
    });
    console.log();

    // 4. Administrateurs
    const admins = await db.Administrateur.findAll({
      include: [
        { model: db.Utilisateur, as: 'Utilisateur' },
        { model: db.Ecole, as: 'Ecole' }
      ]
    });
    console.log(`🔑 Administrateurs: ${admins.length}`);
    admins.forEach(a => {
      console.log(`   - ${a.Utilisateur.email}`);
      console.log(`     École: ${a.Ecole.nom}`);
      console.log(`     ecole_id: ${a.ecole_id}`);
    });
    console.log();

    // 5. Superadministrateurs
    const superadmins = await db.Superadministrateur.findAll({
      include: [{ model: db.Utilisateur, as: 'Utilisateur' }]
    });
    console.log(`👑 Superadministrateurs: ${superadmins.length}`);
    superadmins.forEach(s => {
      console.log(`   - ${s.Utilisateur.email}`);
    });
    console.log();

    // 6. Écoles
    const ecoles = await db.Ecole.findAll();
    console.log(`🏫 Écoles: ${ecoles.length}`);
    ecoles.forEach(e => {
      console.log(`   - ${e.nom} (Active: ${e.estActive})`);
    });
    console.log();

    // 7. Contraintes FK sur administrateurs
    const [fks] = await db.sequelize.query(`
      SELECT 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'equizz_db' 
        AND TABLE_NAME = 'administrateurs' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('🔗 Contraintes FK (administrateurs):');
    fks.forEach(fk => {
      console.log(`   ✅ ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
    console.log();

    console.log('='.repeat(50));
    console.log('✅ SYSTÈME OPÉRATIONNEL - AUCUNE ERREUR DÉTECTÉE');
    console.log('='.repeat(50));
    console.log('\n📋 Comptes de test disponibles:');
    console.log('   Superadmin: super.admin@universitesaintjean.org / admin123');
    console.log('   Admin: admin.sji@saintjeaningenieur.org / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

finalCheck();
