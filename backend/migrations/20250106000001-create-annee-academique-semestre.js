'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Créer la table AnneeAcademique
    await queryInterface.createTable('AnneeAcademique', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      date_debut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      date_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      est_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      est_archive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });

    // Créer la table Semestre
    await queryInterface.createTable('Semestre', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_debut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      date_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      annee_academique_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'AnneeAcademique',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      est_actif: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      est_archive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });

    // Ajouter les colonnes manquantes à la table Cours seulement si elles n'existent pas
    const tableDescription = await queryInterface.describeTable('Cours');
    
    if (!tableDescription.annee_academique_id) {
      await queryInterface.addColumn('Cours', 'annee_academique_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'AnneeAcademique',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!tableDescription.semestre_id) {
      await queryInterface.addColumn('Cours', 'semestre_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Semestre',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Créer les index
    await queryInterface.addIndex('AnneeAcademique', ['est_active'], {
      name: 'unique_active_year',
      unique: true,
      where: {
        est_active: true
      }
    });

    await queryInterface.addIndex('Semestre', ['annee_academique_id', 'numero'], {
      name: 'unique_semester_per_year',
      unique: true
    });

    await queryInterface.addIndex('Semestre', ['est_actif'], {
      name: 'unique_active_semester',
      unique: true,
      where: {
        est_actif: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer les colonnes ajoutées à Cours
    await queryInterface.removeColumn('Cours', 'semestre_id');
    await queryInterface.removeColumn('Cours', 'annee_academique_id');
    
    // Supprimer les tables
    await queryInterface.dropTable('Semestre');
    await queryInterface.dropTable('AnneeAcademique');
  }
};