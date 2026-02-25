// Migration pour créer la table Administrateurs
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Administrateurs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'Utilisateurs',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Clé primaire et étrangère vers Utilisateur'
      },
      ecole_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Ecoles',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'École à laquelle l\'administrateur appartient'
      },
      date_nomination: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de nomination en tant qu\'administrateur'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      comment: 'Table des administrateurs d\'école'
    });

    // Ajouter un index sur ecole_id pour améliorer les performances
    await queryInterface.addIndex('Administrateurs', ['ecole_id'], {
      name: 'idx_administrateurs_ecole_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Administrateurs');
  }
};
