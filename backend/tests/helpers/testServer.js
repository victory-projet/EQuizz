// Helper pour créer un serveur de test
const express = require('express');
const request = require('supertest');

/**
 * Crée une instance de l'application pour les tests
 */
const createTestApp = () => {
  const app = express();
  
  // Middleware de base
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
};

/**
 * Génère un token JWT pour les tests
 */
const generateTestToken = (userId, role = 'etudiant') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Crée un agent de test authentifié
 */
const createAuthenticatedAgent = (app, userId, role = 'etudiant') => {
  const token = generateTestToken(userId, role);
  const agent = request(app);
  
  // Ajouter le token à toutes les requêtes
  agent.auth = (req) => req.set('Authorization', `Bearer ${token}`);
  
  return agent;
};

module.exports = {
  createTestApp,
  generateTestToken,
  createAuthenticatedAgent,
};
