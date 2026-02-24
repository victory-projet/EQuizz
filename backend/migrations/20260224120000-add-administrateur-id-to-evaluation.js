'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne administrateur_id à la table Evaluation
    await queryInterface.addColumn('Evaluation', 'administrateur_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'administrateurs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    console.log('✅ Colonne administrateur_id ajoutée à la table Evaluation');
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer la colonne administrateur_id
    await queryInterface.removeColumn('Evaluation', 'administrateur_id');
    console.log('✅ Colonne administrateur_id supprimée de la table Evaluation');
  }
};
