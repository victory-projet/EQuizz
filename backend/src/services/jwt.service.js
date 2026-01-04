// backend/src/services/jwt.service.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Nous allons stocker la clé secrète dans notre fichier .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

class JwtService {
  generateToken(utilisateur) {
    // Le payload du token contient des informations utiles pour le frontend
    const payload = {
      id: utilisateur.id,
      email: utilisateur.email,
      // On détermine le rôle de l'utilisateur en regardant quel profil est attaché
      role: utilisateur.Administrateur ? 'admin' : (utilisateur.Enseignant ? 'enseignant' : 'etudiant'),
      type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  generateRefreshToken(utilisateur) {
    const payload = {
      id: utilisateur.id,
      email: utilisateur.email,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  }

  generateTokenPair(utilisateur) {
    return {
      accessToken: this.generateToken(utilisateur),
      refreshToken: this.generateRefreshToken(utilisateur)
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Type de token invalide');
      }
      return decoded;
    } catch (error) {
      throw new Error('Refresh token invalide ou expiré');
    }
  }
}

module.exports = new JwtService();