// Migration: Add school domain field
// Description: Ajoute le champ 'domaine' à la table Ecole pour stocker
// le domaine email spécifique de chaque école (ex: saintjeaningenieur.org)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Ajouter la colonne 'domaine'
      await queryInterface.addColumn(
        'Ecoles',
        'domaine',
        {
          type: Sequelize.STRING,
          allowNull: true, // Temporairement nullable pour les données existantes
          comment: 'Domaine email de l\'école (ex: saintjeaningenieur.org, cpge.org, prepavogt.org)'
        },
        { transaction }
      );

      // 2. Définir les domaines pour les écoles existantes si elles existent
      // Exemple de mapping des écoles aux domaines
      const schoolDomainMap = {
        'Saint Jean Ingenieur': 'saintjeaningenieur.org',
        'CPGE': 'cpge.org',
        'Prepavogt': 'prepavogt.org',
        'Saint Jean Management': 'saintjeanmanagement.org'
      };

      for (const [schoolName, domain] of Object.entries(schoolDomainMap)) {
        await queryInterface.sequelize.query(
          `UPDATE Ecoles SET domaine = :domain WHERE nom = :schoolName`,
          {
            replacements: { domain, schoolName },
            transaction
          }
        );
      }

      // 3. Rendre la colonne NOT NULL après avoir rempli les données
      await queryInterface.changeColumn(
        'Ecoles',
        'domaine',
        {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Domaine email de l\'école (ex: saintjeaningenieur.org, cpge.org, prepavogt.org)'
        },
        { transaction }
      );

      await transaction.commit();
      console.log('Migration applied: domain field added to Ecoles table');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Supprimer la colonne 'domaine'
      await queryInterface.removeColumn(
        'Ecoles',
        'domaine',
        { transaction }
      );

      await transaction.commit();
      console.log('Migration reversed: domain field removed from Ecoles table');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
