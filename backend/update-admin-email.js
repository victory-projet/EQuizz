// Script pour mettre à jour l'email du superadmin
require('dotenv').config();
const db = require('./src/models');

async function updateAdminEmail() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Trouver l'ancien utilisateur
    const oldUser = await db.Utilisateur.findOne({ 
      where: { email: 'super.admin@saintjeaningenieur.org' } 
    });

    if (!oldUser) {
      console.log('❌ Aucun utilisateur trouvé avec l\'ancien email');
      process.exit(1);
    }

    console.log('📧 Ancien email:', oldUser.email);
    console.log('👤 ID:', oldUser.id);

    // Mettre à jour l'email
    await db.Utilisateur.update(
      { email: 'super.admin@universitesaintjean' },
      { where: { id: oldUser.id } }
    );

    console.log('✅ Email mis à jour avec succès!');
    console.log('📧 Nouvel email: super.admin@universitesaintjean');
    console.log('🔑 Mot de passe: admin123 (inchangé)');

    // Vérifier la mise à jour
    const updatedUser = await db.Utilisateur.findByPk(oldUser.id);
    console.log('\n✅ Vérification:');
    console.log('   Email:', updatedUser.email);
    console.log('   Nom:', updatedUser.prenom, updatedUser.nom);
    console.log('   Actif:', updatedUser.estActif);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateAdminEmail();
