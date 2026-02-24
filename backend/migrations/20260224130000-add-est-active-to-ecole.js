'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Ecole', 'est_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Indique si l\'école est active dans le système'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Ecole', 'est_active');
  }
};
