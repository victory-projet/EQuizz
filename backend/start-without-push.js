// Script de démarrage temporaire sans les modèles push notifications
const path = require('path');
const fs = require('fs');
const express = require('express');

// Charger .env seulement s'il existe (développement local)
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = express();

// Temporairement désactiver les modèles push notifications
process.env.DISABLE_PUSH_MODELS = 'true';

const db = require('./src/models'); // Importer db pour la connexion
const { initializeFirebase } = require('./src/config/firebase');

// --- Importation des Routeurs (sans push notifications) ---
const authRoutes = require('./src/routes/auth.routes');
const academicRoutes = require('./src/routes/academic.routes');
const evaluationRoutes = require('./src/routes/evaluation.routes');
const studentRoutes = require('./src/routes/student.routes');
const initRoutes = require('./src/routes/init.routes');
const { seedDatabase } = require('./src/routes/init.routes');
const reportRoutes = require('./src/routes/report.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const utilisateurRoutes = require('./src/routes/utilisateur.routes');
const questionRoutes = require('./src/routes/question.routes');

// --- Middlewares Globaux ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// --- Utilisation des Routeurs (sans push notifications) ---
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/init', initRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api', questionRoutes);

// Route temporaire pour les push notifications
app.use('/api/push-notifications', (req, res) => {
  res.status(503).json({
    error: 'Push notifications temporairement désactivées',
    message: 'Service en cours de maintenance'
  });
});

// --- Route 404 ---
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
});

// --- Middleware de gestion d'erreurs ---
const errorHandler = require('./src/middlewares/errorHandler.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

console.log('🔄 Démarrage en mode sans push notifications...');

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie avec succès.');
    // Pas de sync pour éviter les problèmes d'index
    return Promise.resolve();
  })
  .then(async () => {
    console.log('✅ Mode sans synchronisation activé.');
    
    // Initialiser Firebase
    console.log('🔥 Initialisation de Firebase...');
    initializeFirebase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT} (mode sans push notifications)`);
      console.log('💡 Utilisez reset-push-migrations.js pour nettoyer la base');
    });
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });

module.exports = app;