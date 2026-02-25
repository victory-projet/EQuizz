// Script pour corriger l'email du superadmin dans la base de données
require('dotenv').config();
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixSuperadminEmail() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');

    // 1. Chercher tous les utilisateurs avec "super" ou "admin" dans l'email
    console.log('🔍 Recherche des comptes admin existants...');
    const admins = await db.Utilisateur.findAll({
      where: {
        email: {
          [db.Sequelize.Op.or]: [
            { [db.Sequelize.Op.like]: '%super%' },
            { [db.Sequelize.Op.like]: '%admin%' }
          ]
        }
      },
      include: [{ model: db.Superadministrateur }]
    });

    console.log(`Trouvé ${admins.length} compte(s) admin:\n`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email}`);
      console.log(`     ID: ${admin.id}`);
      console.log(`     Superadmin: ${admin.Superadministrateur ? 'OUI' : 'NON'}`);
      console.log('');
    });

    // 2. Mettre à jour ou créer le superadmin
    const correctEmail = 'super.admin@universitesaintjean.org';
    let superadmin = await db.Utilisateur.findOne({ where: { email: correctEmail } });

    if (superadmin) {
      console.log('✅ Le superadmin avec le bon email existe déjà');
      console.log(`   ID: ${superadmin.id}`);
      console.log(`   Email: ${superadmin.email}`);
      
      // Vérifier qu'il a bien le profil Superadministrateur
      const profile = await db.Superadministrateur.findByPk(superadmin.id);
      if (!profile) {
        console.log('⚠️  Création du profil Superadministrateur...');
        await db.Superadministrateur.create({ id: superadmin.id });
        console.log('✅ Profil créé');
      }
    } else {
      console.log('⚠️  Le superadmin avec le bon email n\'existe pas');
      
      // Chercher l'ancien email
      const oldAdmin = await db.Utilisateur.findOne({
        where: {
          email: {
            [db.Sequelize.Op.or]: [
              'super.admin@saintjeaningenieur.org',
              'super.admin@universitesaintjean'
            ]
          }
        }
      });

      if (oldAdmin) {
        console.log('📝 Mise à jour de l\'email...');
        console.log(`   Ancien: ${oldAdmin.email}`);
        console.log(`   Nouveau: ${correctEmail}`);
        
        await oldAdmin.update({ email: correctEmail });
        console.log('✅ Email mis à jour');
        
        // Vérifier le profil
        const profile = await db.Superadministrateur.findByPk(oldAdmin.id);
        if (!profile) {
          console.log('⚠️  Création du profil Superadministrateur...');
          await db.Superadministrateur.create({ id: oldAdmin.id });
          console.log('✅ Profil créé');
        }
      } else {
        console.log('❌ Aucun compte admin trouvé, création d\'un nouveau...');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const newAdmin = await db.Utilisateur.create({
          nom: 'admin',
          prenom: 'super',
          email: correctEmail,
          motDePasseHash: hashedPassword,
          estActif: true
        }, { hooks: false });
        
        await db.Superadministrateur.create({ id: newAdmin.id });
        console.log('✅ Superadmin créé');
        console.log(`   ID: ${newAdmin.id}`);
        console.log(`   Email: ${newAdmin.email}`);
      }
    }

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const finalAdmin = await db.Utilisateur.findOne({
      where: { email: correctEmail },
      include: [{ model: db.Superadministrateur }]
    });

    if (finalAdmin && finalAdmin.Superadministrateur) {
      console.log('✅ Superadmin correctement configuré:');
      console.log(`   ID: ${finalAdmin.id}`);
      console.log(`   Email: ${finalAdmin.email}`);
      console.log(`   Nom: ${finalAdmin.prenom} ${finalAdmin.nom}`);
      console.log(`   Actif: ${finalAdmin.estActif}`);
      console.log(`   Profil Superadmin: OUI`);
      console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
      console.log(`   Email: ${correctEmail}`);
      console.log(`   Mot de passe: admin123`);
    } else {
      console.log('❌ Problème de configuration');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixSuperadminEmail();
