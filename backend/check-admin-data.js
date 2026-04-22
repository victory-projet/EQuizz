const db = require('./src/models');

async function checkAdminData() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check all users
    const users = await db.Utilisateur.findAll({
      include: [
        { model: db.Superadministrateur, as: 'Superadministrateur' },
        { model: db.Administrateur, as: 'Administrateur', include: [{ model: db.Ecole, as: 'Ecole' }] },
        { model: db.Enseignant, as: 'Enseignant' },
        { model: db.Etudiant, as: 'Etudiant' }
      ]
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach(user => {
      let role = 'UNKNOWN';
      let details = '';
      
      if (user.Superadministrateur) {
        role = 'SUPER-ADMIN';
      } else if (user.Administrateur) {
        role = 'ADMIN';
        details = ` (École: ${user.Administrateur.Ecole ? user.Administrateur.Ecole.nom : 'N/A'})`;
      } else if (user.Enseignant) {
        role = 'ENSEIGNANT';
      } else if (user.Etudiant) {
        role = 'ETUDIANT';
      }

      console.log(`${role}: ${user.email}${details}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Nom: ${user.nom} ${user.prenom}`);
      console.log(`  Password Hash: ${user.motDePasseHash ? user.motDePasseHash.substring(0, 20) + '...' : 'NULL'}`);
      console.log('');
    });

    // Check schools
    const schools = await db.Ecole.findAll();
    console.log(`\nFound ${schools.length} schools:`);
    schools.forEach(school => {
      console.log(`  - ${school.nom} (ID: ${school.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdminData();
