const AppError = require('../utils/AppError');

/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Structure de réponse cohérente
  const errorResponse = {
    status: 'error',
    error: {
      message: err.message || 'Erreur interne du serveur',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: err.details || null
    }
  };

  // Ajouter la stack trace uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Si c'est une erreur AppError personnalisée
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse);
  }

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    errorResponse.error.message = 'Erreur de validation';
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(errorResponse);
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    errorResponse.error.message = 'Cette ressource existe déjà';
    errorResponse.error.code = 'DUPLICATE_ERROR';
    errorResponse.error.details = { field: err.errors[0]?.path };
    return res.status(409).json(errorResponse);
  }

  // Erreur de clé étrangère Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    errorResponse.error.message = 'Référence invalide à une ressource';
    errorResponse.error.code = 'FOREIGN_KEY_ERROR';
    return res.status(400).json(errorResponse);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    errorResponse.error.message = 'Token invalide';
    errorResponse.error.code = 'TOKEN_INVALID';
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.error.message = 'Token expiré';
    errorResponse.error.code = 'TOKEN_EXPIRED';
    return res.status(401).json(errorResponse);
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json(errorResponse);
};

module.exports = errorHandler;
