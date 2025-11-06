const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

//  Middleware pour vérifier la validité du token JWT.

const authenticate = (req, res, next) => {
  // 1. Récupérer l'en-tête 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // 2. Extraire le token (format: "Bearer <token>")
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Si aucun token n'est fourni, renvoyer une erreur 401 (Non autorisé)
  if (!token) {
    return res.status(401).json({ message: 'Aucun token fourni. Accès non autorisé.' });
  }

  // 4. Vérifier le token
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    // Si le token est invalide (expiré, malformé...), renvoyer une erreur 403 (Interdit)
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }

    // 5. Si le token est valide, stocker le payload de l'utilisateur dans l'objet `req`
    // pour que les prochains middlewares et contrôleurs puissent y accéder.
    req.user = userPayload;
    
    // 6. Passer au prochain middleware ou au contrôleur
    next();
  });
};

// Middleware pour vérifier si l'utilisateur authentifié a le rôle 'admin'.

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    // Si l'utilisateur a le rôle 'admin', on continue
    next();
  } else {
    // Sinon, on renvoie une erreur 403 (Interdit)
    res.status(403).json({ message: 'Accès refusé. Rôle administrateur requis.' });
  }
};

module.exports = {
  authenticate,
  isAdmin,
};