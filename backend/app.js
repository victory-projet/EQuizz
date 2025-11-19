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
const academicRoutes = require('./src/routes/academic.routes'); // Notre nouveau routeur
const evaluationRoutes = require('./src/routes/evaluation.routes');
const studentRoutes = require('./src/routes/student.routes');
const initRoutes = require('./src/routes/init.routes');
const quizzRoutes = require('./src/routes/student.routes');

// --- Middlewares Globaux ---
// Middleware pour permettre au serveur de comprendre les requêtes JSON
app.use(express.json());

// --- Utilisation des Routeurs ---
//route de creation e quizz
app.use('/api', quizzRoutes); 

// Toutes les routes définies dans authRoutes seront préfixées par /api/auth
app.use('/api/auth', authRoutes);

// Toutes les routes définies dans academicRoutes seront préfixées par /api/academic
app.use('/api/academic', academicRoutes);

app.use('/api/evaluations', evaluationRoutes);

app.use('/api/student', studentRoutes);

app.use('/api/init', initRoutes);

const PORT = process.env.PORT || 3000;

// Démarrer le serveur et tester la connexion à la base de données
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie avec succès.');
    // Synchroniser la base de données avant de démarrer le serveur
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Base de données synchronisée avec succès.');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur lors de l\'initialisation:', err);
  });

 