'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter les colonnes manquantes à la table Cours
    await queryInterface.addColumn('Cours', 'semestre_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporairement nullable pour la migration
      references: {
        model: 'Semestre',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Cours', 'enseignant_id', {
      type: Sequelize.UUID,
      allowNull: true, // Temporairement nullable pour la migration
      references: {
        model: 'Enseignant',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Optionnel: Mettre à jour les contraintes pour les rendre NOT NULL après avoir assigné des valeurs par défaut
    // Ceci nécessiterait des données par défaut ou une logique métier spécifique
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Cours', 'semestre_id');
    await queryInterface.removeColumn('Cours', 'enseignant_id');
  }
};