/**
 * Utilitaire pour standardiser les réponses de l'API
 * Format uniforme pour toutes les réponses du backend
 */

class ResponseFormatter {
  /**
   * Réponse de succès standard
   * @param {Object} res - Objet response Express
   * @param {*} data - Données à retourner
   * @param {string} message - Message de succès (optionnel)
   * @param {number} statusCode - Code de statut HTTP (défaut: 200)
   * @param {Object} meta - Métadonnées supplémentaires (pagination, etc.)
   */
  static success(res, data, message = 'Opération réussie', statusCode = 200, meta = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse de succès avec pagination
   * @param {Object} res - Objet response Express
   * @param {Array} items - Liste des éléments
   * @param {Object} pagination - Informations de pagination
   * @param {string} message - Message de succès
   * @param {string} itemsKey - Nom de la clé pour les éléments (ex: 'etudiants', 'evaluations')
   */
  static successWithPagination(res, items, pagination, message = 'Données récupérées avec succès', itemsKey = 'items') {
    const response = {
      success: true,
      message,
      data: {
        [itemsKey]: items,
        pagination
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  }

  /**
   * Réponse d'erreur standard
   * @param {Object} res - Objet response Express
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code de statut HTTP
   * @param {*} details - Détails supplémentaires de l'erreur
   * @param {string} errorCode - Code d'erreur spécifique
   */
  static error(res, message = 'Une erreur est survenue', statusCode = 500, details = null, errorCode = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errorCode) {
      response.errorCode = errorCode;
    }

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse d'erreur de validation
   * @param {Object} res - Objet response Express
   * @param {Array} errors - Liste des erreurs de validation
   * @param {string} message - Message d'erreur principal
   */
  static validationError(res, errors, message = 'Erreurs de validation') {
    return this.error(res, message, 400, { validationErrors: errors }, 'VALIDATION_ERROR');
  }

  /**
   * Réponse pour ressource non trouvée
   * @param {Object} res - Objet response Express
   * @param {string} resource - Nom de la ressource
   */
  static notFound(res, resource = 'Ressource') {
    return this.error(res, `${resource} non trouvé(e)`, 404, null, 'NOT_FOUND');
  }

  /**
   * Réponse pour accès non autorisé
   * @param {Object} res - Objet response Express
   * @param {string} message - Message personnalisé
   */
  static unauthorized(res, message = 'Accès non autorisé') {
    return this.error(res, message, 401, null, 'UNAUTHORIZED');
  }

  /**
   * Réponse pour accès interdit
   * @param {Object} res - Objet response Express
   * @param {string} message - Message personnalisé
   */
  static forbidden(res, message = 'Accès interdit') {
    return this.error(res, message, 403, null, 'FORBIDDEN');
  }

  /**
   * Réponse de création réussie
   * @param {Object} res - Objet response Express
   * @param {*} data - Données créées
   * @param {string} message - Message de succès
   */
  static created(res, data, message = 'Ressource créée avec succès') {
    return this.success(res, data, message, 201);
  }

  /**
   * Réponse de suppression réussie
   * @param {Object} res - Objet response Express
   * @param {string} message - Message de succès
   */
  static deleted(res, message = 'Ressource supprimée avec succès') {
    return this.success(res, null, message, 200);
  }

  /**
   * Format spécial pour maintenir la compatibilité avec le frontend existant
   * Retourne directement les données dans le format attendu par Angular
   * @param {Object} res - Objet response Express
   * @param {Array} items - Liste des éléments
   * @param {Object} pagination - Informations de pagination
   * @param {string} itemsKey - Nom de la clé pour les éléments
   */
  static compatibilityFormat(res, items, pagination, itemsKey = 'items') {
    const response = {
      [itemsKey]: items,
      pagination
    };

    return res.status(200).json(response);
  }
}

module.exports = ResponseFormatter;