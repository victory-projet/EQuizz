'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renommer la table Administrateurs en Superadministrateurs
    await queryInterface.renameTable('Administrateurs', 'Superadministrateurs');
  },

  down: async (queryInterface, Sequelize) => {
    // Revenir en arrière si nécessaire
    await queryInterface.renameTable('Superadministrateurs', 'Administrateurs');
  }
};
