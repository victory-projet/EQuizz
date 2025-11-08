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

module.exports = {
  authenticate,
  isAdmin,
};