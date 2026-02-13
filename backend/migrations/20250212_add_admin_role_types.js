// Migration: Add admin role types
// Description: Ajoute les colonnes 'type' et 'ecole_id' au modèle Administrateur
// pour supporter SuperAdmin et Admin scolaire avec visibilité limitée

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Ajouter la colonne 'type' (ENUM)
      await queryInterface.addColumn(
        'Administrateurs',
        'type',
        {
          type: Sequelize.ENUM('SUPERADMIN', 'ADMIN'),
          allowNull: false,
          defaultValue: 'ADMIN',
          comment: 'SUPERADMIN: accès à tout le système. ADMIN: accès limité à son école'
        },
        { transaction }
      );

      // 2. Ajouter la colonne 'ecole_id' (UUID, nullable)
      await queryInterface.addColumn(
        'Administrateurs',
        'ecole_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Ecoles',
            key: 'id'
          },
          onDelete: 'SET NULL',
          comment: 'NULL pour SuperAdmin, UUID pour Admin scolaire'
        },
        { transaction }
      );

      // 3. Créer un index sur (ecole_id, type) pour améliorer les requêtes
      await queryInterface.addIndex(
        'Administrateurs',
        ['ecole_id', 'type'],
        {
          name: 'idx_admin_ecole_type',
          transaction
        }
      );

      // 4. Tous les admins existants deviennent SUPERADMIN par défaut (ils avaient accès à tout)
      // Pas besoin de mettre à jour car defaultValue est déjà 'ADMIN'
      // Les existants restent en ADMIN et ont accès à tout sauf via ecole_id=null qui signifie SuperAdmin
      
      // Attendez, c'est important: les admins existants doivent devenir SUPERADMIN
      // Mettre à jour tous les admins existants en SUPERADMIN
      await queryInterface.sequelize.query(
        'UPDATE Administrateurs SET type = :type WHERE type = :oldType OR 1=1',
        {
          replacements: { type: 'SUPERADMIN', oldType: 'ADMIN' },
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Supprimer l'index
      await queryInterface.removeIndex(
        'Administrateurs',
        'idx_admin_ecole_type',
        { transaction }
      );

      // 2. Supprimer la colonne 'ecole_id'
      await queryInterface.removeColumn('Administrateurs', 'ecole_id', { transaction });

      // 3. Supprimer la colonne 'type'
      await queryInterface.removeColumn('Administrateurs', 'type', { transaction });

      // 4. Supprimer le type ENUM si nécessaire
      // Note: La suppression du type ENUM dépend de la base de données

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
