'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter le champ dateImport aux tables principales
    const tables = ['ecole', 'classe', 'cours', 'utilisateur', 'etudiant', 'enseignant'];
    
    for (const table of tables) {
      await queryInterface.addColumn(table, 'date_import', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date du dernier import Excel pour cet enregistrement'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = ['ecole', 'classe', 'cours', 'utilisateur', 'etudiant', 'enseignant'];
    
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'date_import');
    }
  }
};
