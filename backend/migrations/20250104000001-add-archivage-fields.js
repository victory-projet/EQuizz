'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Ajouter les champs d'archivage à la table Evaluation
      await queryInterface.addColumn('Evaluation', 'estArchive', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('Evaluation', 'dateArchivage', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Evaluation', 'archivedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Utilisateur',
          key: 'id'
        }
      }, { transaction });

      // Ajouter les champs d'archivage à la table Question
      await queryInterface.addColumn('Question', 'estArchive', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('Question', 'dateArchivage', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Question', 'archivedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Utilisateur',
          key: 'id'
        }
      }, { transaction });

      // Ajouter les champs d'archivage à la table Etudiant
      await queryInterface.addColumn('Etudiant', 'estArchive', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('Etudiant', 'dateArchivage', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Etudiant', 'archivedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Utilisateur',
          key: 'id'
        }
      }, { transaction });

      // Ajouter les champs d'archivage à la table Classe
      await queryInterface.addColumn('Classe', 'estArchive', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('Classe', 'dateArchivage', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Classe', 'archivedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Utilisateur',
          key: 'id'
        }
      }, { transaction });

      // Ajouter les champs d'archivage à la table CoursEnseignant
      await queryInterface.addColumn('CoursEnseignant', 'estArchive', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('CoursEnseignant', 'dateArchivage', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('CoursEnseignant', 'archivedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Utilisateur',
          key: 'id'
        }
      }, { transaction });

      // Ajouter les champs d'archivage au modèle Cours s'ils n'existent pas déjà
      const coursColumns = await queryInterface.describeTable('Cours');
      
      if (!coursColumns.dateArchivage) {
        await queryInterface.addColumn('Cours', 'dateArchivage', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }

      if (!coursColumns.archivedBy) {
        await queryInterface.addColumn('Cours', 'archivedBy', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Utilisateur',
            key: 'id'
          }
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Supprimer les colonnes d'archivage de toutes les tables
      const tables = ['Evaluation', 'Question', 'Etudiant', 'Classe', 'CoursEnseignant', 'Cours'];
      const columns = ['estArchive', 'dateArchivage', 'archivedBy'];

      for (const table of tables) {
        for (const column of columns) {
          try {
            await queryInterface.removeColumn(table, column, { transaction });
          } catch (error) {
            // Ignorer si la colonne n'existe pas
            console.log(`Column ${column} does not exist in table ${table}`);
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};