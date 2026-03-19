'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('etudiant', 'matricule_univ', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'id',
      comment: 'Identifiant unique permanent au niveau de l\'université'
    });
    console.log('✅ Colonne matricule_univ ajoutée à la table etudiant');
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('etudiant', 'matricule_univ');
  }
};
