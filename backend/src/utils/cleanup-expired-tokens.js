// Script pour nettoyer les tokens de réinitialisation expirés
// À exécuter périodiquement (cron job)

const db = require('../models');

async function cleanupExpiredTokens() {
  try {
    const result = await db.PasswordResetToken.destroy({
      where: {
        expiresAt: {
          [db.Sequelize.Op.lt]: new Date()
        }
      }
    });

    console.log(`✅ ${result} token(s) expiré(s) supprimé(s)`);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des tokens expirés:', error);
    throw error;
  }
}

// Si exécuté directement
if (require.main === module) {
  cleanupExpiredTokens()
    .then(() => {
      console.log('Nettoyage terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = cleanupExpiredTokens;
