// Script pour créer un administrateur d'école
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function createAdministrateur() {
  try {
    console.log('🔧 Création d\'un administrateur d\'école...\n');

    // 1. Vérifier qu'il y a au moins une école
    const ecoles = await db.Ecole.findAll();
    if (ecoles.length === 0) {
      console.error('❌ Aucune école trouvée. Veuillez d\'abord créer une école.');
      process.exit(1);
    }

    console.log(`📚 Écoles disponibles:`);
    ecoles.forEach((ecole, index) => {
      console.log(`   ${index + 1}. ${ecole.nom} (ID: ${ecole.id})`);
    });

    // Pour cet exemple, on prend la première école
    const ecole = ecoles[0];
    console.log(`\n✅ École sélectionnée: ${ecole.nom}\n`);

    // 2. Données de l'administrateur
    const adminData = {
      nom: 'Admin',
      prenom: 'Ecole',
      email: 'admin.sji@saintjeaningenieur.org',
      motDePasse: 'admin123'
    };

    // 3. Vérifier si l'utilisateur existe déjà
    let utilisateur = await db.Utilisateur.findOne({
      where: { email: adminData.email }
    });

    if (utilisateur) {
      console.log('⚠️  L\'utilisateur existe déjà. Mise à jour...');
      
      // Mettre à jour le mot de passe
      utilisateur.motDePasseHash = adminData.motDePasse;
      await utilisateur.save();
      
      // Vérifier si l'administrateur existe
      let administrateur = await db.Administrateur.findByPk(utilisateur.id);
      if (!administrateur) {
        // Créer l'entrée administrateur
        console.log('Création avec ecole.id:', ecole.id);
        administrateur = await db.Administrateur.create({
          id: utilisateur.id,
          ecoleId: ecole.id,
          ecole_id: ecole.id
        });
        console.log('✅ Entrée administrateur créée');
      } else {
        // Mettre à jour l'école
        administrateur.ecoleId = ecole.id;
        await administrateur.save();
        console.log('✅ École de l\'administrateur mise à jour');
      }
    } else {
      // 4. Créer l'utilisateur
      utilisateur = await db.Utilisateur.create({
        nom: adminData.nom,
        prenom: adminData.prenom,
        email: adminData.email,
        motDePasseHash: adminData.motDePasse,
        estActif: true
      });
      console.log('✅ Utilisateur créé');

      // 5. Créer l'entrée administrateur
      console.log('Création avec ecole.id:', ecole.id);
      await db.Administrateur.create({
        id: utilisateur.id,
        ecoleId: ecole.id,
        ecole_id: ecole.id
      });
      console.log('✅ Administrateur créé');
    }

    // 6. Récupérer l'administrateur complet
    const adminComplet = await db.Utilisateur.findByPk(utilisateur.id, {
      include: [
        {
          model: db.Administrateur,
          as: 'Administrateur',
          include: [{ model: db.Ecole, as: 'Ecole' }]
        }
      ]
    });

    console.log('\n✅ Administrateur créé/mis à jour avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log(`   Email: ${adminComplet.email}`);
    console.log(`   Mot de passe: ${adminData.motDePasse}`);
    console.log(`   École: ${adminComplet.Administrateur.Ecole.nom}`);
    console.log(`   Rôle: ADMIN\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    process.exit(1);
  }
}

// Exécuter le script
createAdministrateur();
