const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(AppError.unauthorized('Aucun token fourni. Accès non autorisé.', 'TOKEN_MISSING'));
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(AppError.unauthorized('Session expirée. Veuillez vous reconnecter.', 'TOKEN_EXPIRED'));
      }
      return next(AppError.unauthorized('Token invalide.', 'TOKEN_INVALID'));
    }

    req.user = userPayload;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(AppError.forbidden('Accès refusé. Rôle administrateur requis.', 'ADMIN_REQUIRED'));
  }
};

// Middleware pour autoriser certains rôles
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentification requise.', 'AUTH_REQUIRED'));
    }

    // Convertir les rôles en majuscules pour la comparaison
    const allowedRoles = roles.map(role => role.toUpperCase());
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      return next(AppError.forbidden(`Accès refusé. Rôle requis: ${roles.join(', ')}`, 'ROLE_REQUIRED'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  isAdmin,
  authorize,
};