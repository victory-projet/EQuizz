'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Etudiants', 'matriculeUniv', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null initially to avoid issues with existing data, will fill and set to false later if needed
      unique: true,
      after: 'id',
      comment: 'Identifiant unique permanent au niveau de l\'université'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Etudiants', 'matriculeUniv');
  }
};
