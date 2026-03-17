'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Ajout des colonnes est_archive...');

    // Ajouter estArchive à Classe
    await queryInterface.addColumn('Classe', 'est_archive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    console.log('✅ Colonne est_archive ajoutée à Classe');

    // Ajouter estArchive à Evaluation
    await queryInterface.addColumn('Evaluation', 'est_archive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    console.log('✅ Colonne est_archive ajoutée à Evaluation');

    console.log('✅ Migration terminée avec succès');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Suppression des colonnes est_archive...');

    await queryInterface.removeColumn('Classe', 'est_archive');
    console.log('✅ Colonne est_archive supprimée de Classe');

    await queryInterface.removeColumn('Evaluation', 'est_archive');
    console.log('✅ Colonne est_archive supprimée de Evaluation');

    console.log('✅ Rollback terminé avec succès');
  }
};
