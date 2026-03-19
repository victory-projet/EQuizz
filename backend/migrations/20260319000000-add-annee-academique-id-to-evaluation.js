'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('evaluations', 'annee_academique_id', {
      type: Sequelize.UUID,
      allowNull: true, // nullable pour ne pas bloquer les lignes existantes
      references: {
        model: 'annee_academiques',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'cours_id'
    });

    console.log('✅ Colonne annee_academique_id ajoutée à la table evaluations');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('evaluations', 'annee_academique_id');
    console.log('✅ Colonne annee_academique_id supprimée de la table evaluations');
  }
};
