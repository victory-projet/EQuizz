'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Créer la table de jonction CoursEnseignant
    await queryInterface.createTable('CoursEnseignant', {
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Ajouter un index unique pour éviter les doublons
    await queryInterface.addIndex('CoursEnseignant', ['cours_id', 'enseignant_id'], {
      unique: true,
      name: 'cours_enseignant_unique'
    });

    // Migrer les données existantes si la colonne enseignant_id existe
    const tableInfo = await queryInterface.describeTable('Cours');
    if (tableInfo.enseignant_id) {
      // Copier les relations existantes vers la nouvelle table
      await queryInterface.sequelize.query(`
        INSERT INTO CoursEnseignant (cours_id, enseignant_id, created_at, updated_at)
        SELECT id, enseignant_id, NOW(), NOW()
        FROM Cours 
        WHERE enseignant_id IS NOT NULL
      `);

      // Supprimer l'ancienne colonne
      await queryInterface.removeColumn('Cours', 'enseignant_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Ajouter la colonne enseignant_id de retour
    await queryInterface.addColumn('Cours', 'enseignant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Enseignant',
        key: 'id'
      }
    });

    // Migrer une relation par cours (prendre le premier enseignant)
    await queryInterface.sequelize.query(`
      UPDATE Cours 
      SET enseignant_id = (
        SELECT enseignant_id 
        FROM CoursEnseignant 
        WHERE CoursEnseignant.cours_id = Cours.id 
        LIMIT 1
      )
    `);

    // Supprimer la table de jonction
    await queryInterface.dropTable('CoursEnseignant');
  }
};