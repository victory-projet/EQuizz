/**
 * Classe d'erreur personnalisée pour l'application
 * Permet de créer des erreurs avec des codes et statuts HTTP spécifiques
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Indique que c'est une erreur attendue
    
    Error.captureStackTrace(this, this.constructor);
  }

  // Erreurs 400 - Bad Request
  static badRequest(message = 'Requête invalide.', code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  // Erreurs 401 - Unauthorized
  static unauthorized(message = 'Non autorisé.', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  // Erreurs 403 - Forbidden
  static forbidden(message = 'Accès refusé.', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  // Erreurs 404 - Not Found
  static notFound(message = 'Ressource non trouvée.', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  // Erreurs 409 - Conflict
  static conflict(message = 'Conflit de données.', code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  // Erreurs 422 - Unprocessable Entity
  static unprocessable(message = 'Données non traitables.', code = 'UNPROCESSABLE') {
    return new AppError(message, 422, code);
  }

  // Erreurs 429 - Too Many Requests
  static tooManyRequests(message = 'Trop de requêtes.', code = 'TOO_MANY_REQUESTS') {
    return new AppError(message, 429, code);
  }

  // Erreurs 500 - Internal Server Error
  static internal(message = 'Erreur interne du serveur.', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }

  // Erreurs 503 - Service Unavailable
  static serviceUnavailable(message = 'Service temporairement indisponible.', code = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, code);
  }
}

module.exports = AppError;
