// backend/migrations/20250102000001-add-push-notifications-tables.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Table DeviceToken
    await queryInterface.createTable('DeviceToken', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      utilisateur_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Utilisateur',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      platform: {
        type: Sequelize.ENUM('android', 'ios', 'web'),
        allowNull: false,
      },
      deviceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      appVersion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      lastUsed: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // Table NotificationPreference
    await queryInterface.createTable('NotificationPreference', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      utilisateur_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Utilisateur',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nouvelleEvaluation: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      rappelEvaluation: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      evaluationFermee: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      resultatsDisponibles: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      confirmationSoumission: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      securite: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      pushNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      heureDebutNotifications: {
        type: Sequelize.TIME,
        defaultValue: '08:00:00',
        allowNull: false,
      },
      heureFinNotifications: {
        type: Sequelize.TIME,
        defaultValue: '22:00:00',
        allowNull: false,
      },
      frequenceRappels: {
        type: Sequelize.ENUM('JAMAIS', 'UNE_FOIS', 'QUOTIDIEN', 'DEUX_FOIS_PAR_JOUR'),
        defaultValue: 'UNE_FOIS',
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // Index pour DeviceToken
    await queryInterface.addIndex('DeviceToken', {
      fields: ['utilisateur_id'],
      name: 'device_token_user_index'
    });

    await queryInterface.addIndex('DeviceToken', {
      fields: ['platform'],
      name: 'device_token_platform_index'
    });

    await queryInterface.addIndex('DeviceToken', {
      fields: ['isActive'],
      name: 'device_token_active_index'
    });

    await queryInterface.addIndex('DeviceToken', {
      fields: ['lastUsed'],
      name: 'device_token_last_used_index'
    });

    // Index pour NotificationPreference
    await queryInterface.addIndex('NotificationPreference', {
      fields: ['utilisateur_id'],
      unique: true,
      name: 'notification_preference_user_unique'
    });

    console.log('✅ Tables de push notifications créées avec succès');
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les index
    await queryInterface.removeIndex('DeviceToken', 'device_token_user_index');
    await queryInterface.removeIndex('DeviceToken', 'device_token_platform_index');
    await queryInterface.removeIndex('DeviceToken', 'device_token_active_index');
    await queryInterface.removeIndex('DeviceToken', 'device_token_last_used_index');
    await queryInterface.removeIndex('NotificationPreference', 'notification_preference_user_unique');

    // Supprimer les tables
    await queryInterface.dropTable('NotificationPreference');
    await queryInterface.dropTable('DeviceToken');

    console.log('✅ Tables de push notifications supprimées');
  }
};