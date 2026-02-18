'use strict';

module.exports = {
  async up(queryInterface, _Sequelize) {
    console.log('🧹 Nettoyage des tables push notifications existantes...');

    try {
      // Désactiver les contraintes de clés étrangères temporairement
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

      // Supprimer les tables si elles existent
      await queryInterface.dropTable('NotificationPreference', { cascade: true });
      console.log('✅ Table NotificationPreference supprimée');
    } catch (error) {
      console.log('ℹ️  Table NotificationPreference n\'existe pas');
    }

    try {
      await queryInterface.dropTable('DeviceToken', { cascade: true });
      console.log('✅ Table DeviceToken supprimée');
    } catch (error) {
      console.log('ℹ️  Table DeviceToken n\'existe pas');
    }

    // Réactiver les contraintes de clés étrangères
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Nettoyage terminé');
  },

  async down(_queryInterface, _Sequelize) {
    // Rien à faire pour le rollback
    console.log('ℹ️  Rollback du nettoyage - rien à faire');
  }
};