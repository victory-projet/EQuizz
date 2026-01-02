// backend/src/controllers/push-notification.controller.js

const firebasePushService = require('../services/firebase-push.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

class PushNotificationController {
  /**
   * Enregistre un token FCM pour l'utilisateur connecté
   */
  registerToken = asyncHandler(async (req, res) => {
    const { token, platform, deviceId, appVersion } = req.body;
    const utilisateurId = req.user.id;

    if (!token || !platform) {
      throw AppError.badRequest('Token et plateforme requis', 'MISSING_FIELDS');
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      throw AppError.badRequest('Plateforme invalide', 'INVALID_PLATFORM');
    }

    const deviceToken = await firebasePushService.registerToken(
      utilisateurId,
      token,
      platform,
      deviceId,
      appVersion
    );

    res.status(201).json({
      message: 'Token enregistré avec succès',
      deviceToken: {
        id: deviceToken.id,
        platform: deviceToken.platform,
        isActive: deviceToken.isActive,
        lastUsed: deviceToken.lastUsed
      }
    });
  });

  /**
   * Désactive un token FCM pour l'utilisateur connecté
   */
  unregisterToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const utilisateurId = req.user.id;

    if (!token) {
      throw AppError.badRequest('Token requis', 'MISSING_TOKEN');
    }

    await firebasePushService.unregisterToken(utilisateurId, token);

    res.status(200).json({
      message: 'Token désactivé avec succès'
    });
  });

  /**
   * Récupère les tokens actifs de l'utilisateur connecté
   */
  getMyTokens = asyncHandler(async (req, res) => {
    const utilisateurId = req.user.id;
    const db = require('../models');

    const tokens = await db.DeviceToken.findAll({
      where: {
        utilisateur_id: utilisateurId,
        isActive: true
      },
      attributes: ['id', 'platform', 'deviceId', 'appVersion', 'lastUsed', 'createdAt'],
      order: [['lastUsed', 'DESC']]
    });

    res.status(200).json({
      tokens: tokens.map(token => ({
        id: token.id,
        platform: token.platform,
        deviceId: token.deviceId,
        appVersion: token.appVersion,
        lastUsed: token.lastUsed,
        registeredAt: token.createdAt
      }))
    });
  });

  /**
   * Met à jour les préférences de notification de l'utilisateur
   */
  updatePreferences = asyncHandler(async (req, res) => {
    const utilisateurId = req.user.id;
    const preferences = req.body;
    const db = require('../models');

    // Valider les préférences
    const validFields = [
      'nouvelleEvaluation', 'rappelEvaluation', 'evaluationFermee',
      'resultatsDisponibles', 'confirmationSoumission', 'securite',
      'pushNotifications', 'emailNotifications',
      'heureDebutNotifications', 'heureFinNotifications', 'frequenceRappels'
    ];

    const updateData = {};
    for (const field of validFields) {
      if (preferences[field] !== undefined) {
        updateData[field] = preferences[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest('Aucune préférence valide fournie', 'NO_VALID_PREFERENCES');
    }

    // Mettre à jour ou créer les préférences
    const [notificationPreference, created] = await db.NotificationPreference.findOrCreate({
      where: { utilisateur_id: utilisateurId },
      defaults: { utilisateur_id: utilisateurId, ...updateData }
    });

    if (!created) {
      await notificationPreference.update(updateData);
    }

    res.status(200).json({
      message: 'Préférences mises à jour avec succès',
      preferences: {
        nouvelleEvaluation: notificationPreference.nouvelleEvaluation,
        rappelEvaluation: notificationPreference.rappelEvaluation,
        evaluationFermee: notificationPreference.evaluationFermee,
        resultatsDisponibles: notificationPreference.resultatsDisponibles,
        confirmationSoumission: notificationPreference.confirmationSoumission,
        securite: notificationPreference.securite,
        pushNotifications: notificationPreference.pushNotifications,
        emailNotifications: notificationPreference.emailNotifications,
        heureDebutNotifications: notificationPreference.heureDebutNotifications,
        heureFinNotifications: notificationPreference.heureFinNotifications,
        frequenceRappels: notificationPreference.frequenceRappels
      }
    });
  });

  /**
   * Récupère les préférences de notification de l'utilisateur
   */
  getPreferences = asyncHandler(async (req, res) => {
    const utilisateurId = req.user.id;
    const preferences = await firebasePushService.getUserNotificationPreferences(utilisateurId);

    res.status(200).json({
      preferences: {
        nouvelleEvaluation: preferences.nouvelleEvaluation,
        rappelEvaluation: preferences.rappelEvaluation,
        evaluationFermee: preferences.evaluationFermee,
        resultatsDisponibles: preferences.resultatsDisponibles,
        confirmationSoumission: preferences.confirmationSoumission,
        securite: preferences.securite,
        pushNotifications: preferences.pushNotifications,
        emailNotifications: preferences.emailNotifications,
        heureDebutNotifications: preferences.heureDebutNotifications,
        heureFinNotifications: preferences.heureFinNotifications,
        frequenceRappels: preferences.frequenceRappels
      }
    });
  });

  /**
   * Teste l'envoi d'une notification push (pour développement)
   */
  testNotification = asyncHandler(async (req, res) => {
    const utilisateurId = req.user.id;
    const { title = 'Test Notification', body = 'Ceci est un test de notification push' } = req.body;

    const result = await firebasePushService.sendToUser(
      utilisateurId,
      { title, body },
      { type: 'test', timestamp: Date.now().toString() }
    );

    res.status(200).json({
      message: 'Test de notification envoyé',
      result
    });
  });
}

module.exports = new PushNotificationController();