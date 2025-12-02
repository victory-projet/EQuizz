// backend/src/services/jwt.service.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Nous allons stocker la clé secrète dans notre fichier .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

class JwtService {
  generateToken(utilisateur) {
    // Le payload du token contient des informations utiles pour le frontend
    const payload = {
      id: utilisateur.id,
      email: utilisateur.email,
      // On détermine le rôle de l'utilisateur en regardant quel profil est attaché
      role: utilisateur.Administrateur ? 'admin' : (utilisateur.Enseignant ? 'enseignant' : 'etudiant')
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }
}

module.exports = new JwtService();