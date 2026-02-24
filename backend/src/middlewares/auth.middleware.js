const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/AppError');
const db = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const verifyToken = promisify(jwt.verify);

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(AppError.unauthorized('Aucun token fourni. Accès non autorisé.', 'TOKEN_MISSING'));
    }

    // Vérifier le token
    const userPayload = await verifyToken(token, JWT_SECRET);

    // Charger l'utilisateur complet depuis la base de données avec toutes les associations
    const utilisateur = await db.Utilisateur.findByPk(userPayload.id, {
      include: [
        { model: db.Superadministrateur, as: 'Superadministrateur' },
        { 
          model: db.Administrateur, 
          as: 'Administrateur',
          include: [{ model: db.Ecole, as: 'Ecole' }]
        },
        { model: db.Enseignant, as: 'Enseignant' },
        { 
          model: db.Etudiant, 
          as: 'Etudiant',
          include: [{ model: db.Classe, as: 'Classe' }]
        }
      ]
    });

    if (!utilisateur || !utilisateur.estActif) {
      return next(AppError.unauthorized('Utilisateur non trouvé ou inactif.', 'USER_NOT_FOUND'));
    }

    // Ajouter le rôle à l'utilisateur pour faciliter les vérifications
    utilisateur.role = utilisateur.Superadministrateur ? 'super-admin' : 
                       (utilisateur.Administrateur ? 'admin' :
                       (utilisateur.Enseignant ? 'enseignant' : 'etudiant'));

    req.user = utilisateur;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Session expirée. Veuillez vous reconnecter.', 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Token invalide.', 'TOKEN_INVALID'));
    }
    return next(AppError.unauthorized('Erreur d\'authentification.', 'AUTH_ERROR'));
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'super-admin' || req.user.role === 'admin')) {
    next();
  } else {
    next(AppError.forbidden('Accès refusé. Rôle administrateur requis.', 'ADMIN_REQUIRED'));
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super-admin') {
    next();
  } else {
    next(AppError.forbidden('Accès refusé. Rôle super-administrateur requis.', 'SUPER_ADMIN_REQUIRED'));
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
  isSuperAdmin,
  authorize,
};