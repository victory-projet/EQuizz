'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CoursEnseignant', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      cours_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Cours',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enseignant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Enseignant',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('TITULAIRE', 'ASSISTANT', 'INTERVENANT'),
        defaultValue: 'TITULAIRE',
        allowNull: false
      },
      est_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      date_assignation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Index unique pour éviter les doublons
    await queryInterface.addIndex('CoursEnseignant', {
      fields: ['cours_id', 'enseignant_id'],
      unique: true,
      name: 'cours_enseignant_unique'
    });

    // Index pour les requêtes par cours
    await queryInterface.addIndex('CoursEnseignant', {
      fields: ['cours_id'],
      name: 'cours_enseignant_cours_idx'
    });

    // Index pour les requêtes par enseignant
    await queryInterface.addIndex('CoursEnseignant', {
      fields: ['enseignant_id'],
      name: 'cours_enseignant_enseignant_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CoursEnseignant');
  }
};