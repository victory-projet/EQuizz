// Script pour nettoyer les utilisateurs supprimés
require('dotenv').config();
const db = require('./src/models');

async function cleanDeletedUsers() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');

    // 1. Afficher les utilisateurs supprimés
    console.log('🔍 Recherche des utilisateurs supprimés...');
    const deletedUsers = await db.Utilisateur.findAll({
      where: {
        deletedAt: { [db.Sequelize.Op.ne]: null }
      },
      paranoid: false // Inclure les soft-deleted
    });

    if (deletedUsers.length === 0) {
      console.log('✅ Aucun utilisateur supprimé trouvé');
      process.exit(0);
    }

    console.log(`\n⚠️  ${deletedUsers.length} utilisateur(s) supprimé(s) trouvé(s):\n`);
    deletedUsers.forEach(user => {
      console.log(`   - ${user.prenom} ${user.nom}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Supprimé le: ${user.deletedAt}`);
      console.log('');
    });

    // 2. Supprimer définitivement (hard delete)
    console.log('🗑️  Suppression définitive...');
    const count = await db.Utilisateur.destroy({
      where: {
        deletedAt: { [db.Sequelize.Op.ne]: null }
      },
      force: true // Hard delete
    });

    console.log(`✅ ${count} utilisateur(s) supprimé(s) définitivement`);

    // 3. Vérification
    const remaining = await db.Utilisateur.findAll({
      where: {
        deletedAt: { [db.Sequelize.Op.ne]: null }
      },
      paranoid: false
    });

    if (remaining.length === 0) {
      console.log('✅ Nettoyage terminé avec succès');
    } else {
      console.log(`⚠️  ${remaining.length} utilisateur(s) restant(s)`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanDeletedUsers();
