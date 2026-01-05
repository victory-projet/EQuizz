const AppError = require('../utils/AppError');

/**
 * Middleware de gestion centralisée des erreurs
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur pour le debugging
  console.error('🚨 Erreur capturée:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query,
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
    timestamp: new Date().toISOString()
  });

  // Erreurs Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `Cette valeur pour ${field} existe déjà`;
    error = new AppError(message, 400, 'DUPLICATE_ENTRY');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Violation de contrainte de clé étrangère. Vérifiez les relations entre les données.';
    error = new AppError(message, 400, 'FOREIGN_KEY_CONSTRAINT');
  }

  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Erreur de base de données. Vérifiez la syntaxe de votre requête.';
    error = new AppError(message, 500, 'DATABASE_ERROR');
  }

  if (err.name === 'SequelizeConnectionError') {
    const message = 'Erreur de connexion à la base de données';
    error = new AppError(message, 500, 'CONNECTION_ERROR');
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide. Veuillez vous reconnecter.';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré. Veuillez vous reconnecter.';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Erreurs de validation Joi (si utilisé)
  if (err.name === 'ValidationError' && err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Erreurs Multer (upload de fichiers)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Type de fichier non autorisé';
    error = new AppError(message, 400, 'INVALID_FILE_TYPE');
  }

  // Erreurs de cast (MongoDB/Mongoose style, adaptable)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Format JSON invalide';
    error = new AppError(message, 400, 'INVALID_JSON');
  }

  // Erreurs de permissions
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    const message = 'Permissions insuffisantes';
    error = new AppError(message, 403, 'INSUFFICIENT_PERMISSIONS');
  }

  // Erreurs de fichier non trouvé
  if (err.code === 'ENOENT') {
    const message = 'Fichier ou ressource non trouvé';
    error = new AppError(message, 404, 'FILE_NOT_FOUND');
  }

  // Erreurs de réseau/timeout
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    const message = 'Service temporairement indisponible';
    error = new AppError(message, 503, 'SERVICE_UNAVAILABLE');
  }

  // Si ce n'est pas une AppError, créer une erreur générique
  if (!(error instanceof AppError)) {
    error = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'Une erreur interne s\'est produite' 
        : err.message || 'Erreur interne du serveur',
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR'
    );
  }

  // Réponse d'erreur structurée
  const errorResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: {
          name: err.name,
          originalMessage: err.message
        }
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Ajouter des suggestions pour certaines erreurs
  if (error.code === 'VALIDATION_ERROR') {
    errorResponse.suggestion = 'Vérifiez que tous les champs requis sont remplis et respectent le format attendu.';
  }

  if (error.code === 'DUPLICATE_ENTRY') {
    errorResponse.suggestion = 'Cette valeur existe déjà. Veuillez utiliser une valeur différente.';
  }

  if (error.code === 'FOREIGN_KEY_CONSTRAINT') {
    errorResponse.suggestion = 'Assurez-vous que les références vers d\'autres entités sont valides.';
  }

  if (error.code === 'INVALID_TOKEN' || error.code === 'TOKEN_EXPIRED') {
    errorResponse.suggestion = 'Veuillez vous reconnecter pour obtenir un nouveau token d\'authentification.';
  }

  // Envoyer la réponse d'erreur
  res.status(error.statusCode || 500).json(errorResponse);
};

/**
 * Middleware pour capturer les erreurs 404
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} non trouvée`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Middleware pour capturer les erreurs non gérées
 */
const uncaughtErrorHandler = () => {
  // Capturer les erreurs non gérées
  process.on('uncaughtException', (err) => {
    console.error('🚨 UNCAUGHT EXCEPTION! Arrêt du serveur...');
    console.error('Erreur:', err.name, err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  });

  // Capturer les promesses rejetées non gérées
  process.on('unhandledRejection', (err) => {
    console.error('🚨 UNHANDLED REJECTION! Arrêt du serveur...');
    console.error('Erreur:', err);
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  uncaughtErrorHandler
};