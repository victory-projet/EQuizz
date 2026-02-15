'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HistoriqueEtudiant', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      etudiant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Etudiant',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'UUID permanent de l\'étudiant'
      },
      matricule: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Matricule utilisé pendant cette période'
      },
      ecole_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Ecole',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'École fréquentée pendant cette période'
      },
      classe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Classe',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Classe fréquentée pendant cette période'
      },
      dateDebut: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Date de début dans cette école/classe'
      },
      dateFin: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de fin (null si période actuelle)'
      },
      estPeriodeActuelle: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Indique si c\'est la période actuelle de l\'étudiant'
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

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('HistoriqueEtudiant', ['etudiant_id'], {
      name: 'idx_historique_etudiant_id'
    });

    await queryInterface.addIndex('HistoriqueEtudiant', ['matricule'], {
      name: 'idx_historique_matricule'
    });

    await queryInterface.addIndex('HistoriqueEtudiant', ['estPeriodeActuelle'], {
      name: 'idx_historique_periode_actuelle'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HistoriqueEtudiant');
  }
};
