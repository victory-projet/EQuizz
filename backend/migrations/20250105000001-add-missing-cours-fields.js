'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cette migration est maintenant gérée par 20250106000001-create-annee-academique-semestre.js
    // Ajouter seulement enseignant_id si il n'existe pas déjà
    const tableDescription = await queryInterface.describeTable('Cours');
    
    if (!tableDescription.enseignant_id) {
      await queryInterface.addColumn('Cours', 'enseignant_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Enseignant',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Cours');
    
    if (tableDescription.enseignant_id) {
      await queryInterface.removeColumn('Cours', 'enseignant_id');
    }
  }
};