const db = require('./src/models');

async function testUsersAPI() {
  try {
    console.log('🔍 Test de l\'API utilisateurs...\n');
    
    // 1. Vérifier les données brutes dans la BD
    console.log('1️⃣ Données brutes dans la BD:');
    const [rawUsers] = await db.sequelize.query('SELECT * FROM utilisateur');
    console.log(`   Total utilisateurs: ${rawUsers.length}`);
    rawUsers.forEach(u => {
      console.log(`   - ${u.prenom} ${u.nom} (${u.email})`);
    });
    
    const [rawSuperAdmins] = await db.sequelize.query('SELECT * FROM superadministrateur');
    console.log(`\n   Total superadministrateurs: ${rawSuperAdmins.length}`);
    rawSuperAdmins.forEach(sa => {
      console.log(`   - ID: ${sa.id}`);
    });
    
    // 2. Tester la requête avec les includes
    console.log('\n2️⃣ Test avec Sequelize includes:');
    const utilisateurs = await db.Utilisateur.findAll({
      include: [
        { model: db.Superadministrateur },
        { model: db.Enseignant },
        { model: db.Etudiant }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`   Total utilisateurs trouvés: ${utilisateurs.length}`);
    
    utilisateurs.forEach(user => {
      const userData = user.toJSON();
      console.log(`\n   Utilisateur: ${userData.prenom} ${userData.nom}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Superadministrateur: ${!!userData.Superadministrateur}`);
      console.log(`   - Enseignant: ${!!userData.Enseignant}`);
      console.log(`   - Etudiant: ${!!userData.Etudiant}`);
      
      if (userData.Superadministrateur) {
        console.log(`   - Rôle détecté: ADMIN`);
      } else if (userData.Enseignant) {
        console.log(`   - Rôle détecté: ENSEIGNANT`);
      } else if (userData.Etudiant) {
        console.log(`   - Rôle détecté: ETUDIANT`);
      } else {
        console.log(`   - ⚠️ AUCUN RÔLE DÉTECTÉ!`);
      }
    });
    
    // 3. Simuler la logique du contrôleur
    console.log('\n3️⃣ Simulation de la logique du contrôleur:');
    const utilisateursAvecRole = utilisateurs.map(user => {
      const userData = user.toJSON();
      if (userData.Superadministrateur) {
        userData.role = 'ADMIN';
      } else if (userData.Enseignant) {
        userData.role = 'ENSEIGNANT';
      } else if (userData.Etudiant) {
        userData.role = 'ETUDIANT';
        userData.matricule = userData.Etudiant.matricule;
      }
      return userData;
    });
    
    console.log(`   Utilisateurs avec rôle:`);
    utilisateursAvecRole.forEach(u => {
      console.log(`   - ${u.prenom} ${u.nom}: ${u.role || 'AUCUN RÔLE'}`);
    });
    
    // 4. Vérifier les associations dans le modèle
    console.log('\n4️⃣ Vérification des associations:');
    const associations = db.Utilisateur.associations;
    console.log('   Associations de Utilisateur:');
    Object.keys(associations).forEach(key => {
      console.log(`   - ${key}: ${associations[key].associationType}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testUsersAPI();
