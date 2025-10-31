// backend/app.js

const express = require('express');
require('dotenv').config(); // S'assurer que dotenv est chargé au tout début

const app = express();
const db = require('./src/models'); // Importer db pour la connexion

// --- Importation des Routeurs ---
const authRoutes = require('./src/routes/auth.routes');
const academicRoutes = require('./src/routes/academic.routes'); // Notre nouveau routeur
const evaluationRoutes = require('./src/routes/evaluation.routes');

// --- Middlewares Globaux ---
// Middleware pour permettre au serveur de comprendre les requêtes JSON
app.use(express.json());

// --- Utilisation des Routeurs ---
// Toutes les routes définies dans authRoutes seront préfixées par /api/auth
app.use('/api/auth', authRoutes);

// Toutes les routes définies dans academicRoutes seront préfixées par /api/academic
app.use('/api/academic', academicRoutes);

app.use('/api/evaluations', evaluationRoutes);


const PORT = process.env.PORT || 3000;

// Démarrer le serveur et tester la connexion à la base de données
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie avec succès.');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Impossible de se connecter à la base de données:', err);
  });