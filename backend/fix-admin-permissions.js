// Script pour corriger les permissions administrateur
const db = require('./src/models');

async function fixAdminPermissions() {
  try {
    console.log('🔧 Correction des permissions administrateur...');
    
    // Connexion à la base de données
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Trouver tous les utilisateurs qui devraient être administrateurs
    const adminUsers = await db.Utilisateur.findAll({
      where: {
        email: {
          [db.Sequelize.Op.like]: '%admin%'
        }
      }
    });

    console.log(`📋 ${adminUsers.length} utilisateur(s) administrateur(s) trouvé(s)`);

    for (const user of adminUsers) {
      // Vérifier si le profil administrateur existe
      const existingAdmin = await db.Administrateur.findOne({ where: { id: user.id } });
      
      if (!existingAdmin) {
        // Créer le profil administrateur
        await db.Administrateur.create({
          id: user.id
        });
        console.log(`✅ Profil administrateur créé pour: ${user.email}`);
      } else {
        console.log(`ℹ️  Profil administrateur existe déjà pour: ${user.email}`);
      }
    }

    // Afficher tous les administrateurs
    const allAdmins = await db.Administrateur.findAll({
      include: [{
        model: db.Utilisateur,
        attributes: ['email', 'nom', 'prenom']
      }]
    });

    console.log('\n👥 Administrateurs dans le système:');
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.Utilisateur.email} (${admin.Utilisateur.prenom} ${admin.Utilisateur.nom})`);
    });

    console.log('\n✅ Correction terminée avec succès !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixAdminPermissions();