// Script pour vérifier l'assignation de l'école à l'administrateur
const db = require('./src/models');

async function checkAdminSchool() {
  try {
    console.log('🔍 Vérification de l\'assignation de l\'école à l\'administrateur\n');

    // 1. Vérifier l'admin dans la table Utilisateur
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'admin.sji@saintjeaningenieur.org' },
      include: [
        {
          model: db.Administrateur,
          as: 'Administrateur',
          include: [{ model: db.Ecole, as: 'Ecole' }]
        }
      ]
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   ID: ${utilisateur.id}`);
    console.log(`   Email: ${utilisateur.email}`);
    console.log(`   Nom: ${utilisateur.nom} ${utilisateur.prenom}`);
    console.log('');

    // 2. Vérifier l'entrée dans la table Administrateur
    if (utilisateur.Administrateur) {
      console.log('✅ Profil Administrateur trouvé:');
      console.log(`   ID: ${utilisateur.Administrateur.id}`);
      console.log(`   ecole_id: ${utilisateur.Administrateur.ecole_id}`);
      console.log(`   École: ${utilisateur.Administrateur.Ecole ? utilisateur.Administrateur.Ecole.nom : 'NON ASSIGNÉE'}`);
    } else {
      console.log('❌ Profil Administrateur NON trouvé');
    }
    console.log('');

    // 3. Vérifier directement dans la table Administrateur
    const [results] = await db.sequelize.query(`
      SELECT a.*, e.nom as ecole_nom 
      FROM Administrateur a
      LEFT JOIN Ecole e ON a.ecole_id = e.id
      WHERE a.id = ?
    `, {
      replacements: [utilisateur.id]
    });

    console.log('📊 Requête SQL directe:');
    if (results.length > 0) {
      console.log('   Résultat:', JSON.stringify(results[0], null, 2));
    } else {
      console.log('   ❌ Aucun résultat');
    }
    console.log('');

    // 4. Lister toutes les écoles disponibles
    const ecoles = await db.Ecole.findAll();
    console.log('🏫 Écoles disponibles:');
    ecoles.forEach(ecole => {
      console.log(`   - ${ecole.nom} (ID: ${ecole.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAdminSchool();
