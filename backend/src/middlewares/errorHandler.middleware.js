const AppError = require('../utils/AppError');

/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, next) => {
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

  // Si c'est une erreur AppError personnalisée
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erreur de validation',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: 'Cette ressource existe déjà',
      field: err.errors[0]?.path
    });
  }

  // Erreur de clé étrangère Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Référence invalide à une ressource'
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expiré'
    });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
