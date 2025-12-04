// backend/app.js

const path = require('path');
const fs = require('fs');
const express = require('express');

// Charger .env seulement s'il existe (développement local)
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = express();
const db = require('./src/models'); // Importer db pour la connexion

// --- Importation des Routeurs ---
const authRoutes = require('./src/routes/auth.routes');
const academicRoutes = require('./src/routes/academic.routes');
const evaluationRoutes = require('./src/routes/evaluation.routes');
const studentRoutes = require('./src/routes/student.routes');
const initRoutes = require('./src/routes/init.routes');
const reportRoutes = require('./src/routes/report.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const utilisateurRoutes = require('./src/routes/utilisateur.routes');

// --- Middlewares Globaux ---
// Configuration CORS pour autoriser les requêtes depuis le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Autoriser toutes les origines (à restreindre en production)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware pour permettre au serveur de comprendre les requêtes JSON
app.use(express.json());

// --- Utilisation des Routeurs ---
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/init', initRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

// --- Route 404 pour les endpoints non trouvés ---
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
});

// --- Middleware de gestion d'erreurs (doit être en dernier) ---
const errorHandler = require('./src/middlewares/errorHandler.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
  console.log('🔄 Tentative de connexion à la base de données...');
  
  db.sequelize.authenticate()
    .then(() => {
      console.log('✅ Connexion à la base de données établie avec succès.');
      return db.sequelize.sync({ alter: true }); // Utiliser alter au lieu de force en production
    })
    .then(() => {
      console.log('✅ Base de données synchronisée avec succès.');
      app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ Erreur lors de l\'initialisation:');
      console.error('Type:', err.name);
      console.error('Message:', err.message);
      console.error('Code:', err.code);
      if (err.parent) {
        console.error('Parent Error:', err.parent.message);
      }
      process.exit(1); // Arrêter le processus en cas d'erreur
    });
}

// Exporter l'app pour les tests
module.exports = app;