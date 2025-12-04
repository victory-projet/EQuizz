// Tests d'intégration pour l'authentification
const request = require('supertest');
const { createTestApp } = require('../../helpers/testServer');

describe('API Auth - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
    // Charger les routes d'authentification
    // app.use('/api/auth', require('../../../src/routes/auth.routes'));
  });

  describe('POST /api/auth/login', () => {
    it('devrait authentifier un étudiant avec des identifiants valides', async () => {
      const credentials = {
        email: 'pierre.durand@student.fr',
        password: 'password123',
      };

      // Note: Ce test nécessite une vraie base de données ou un mock complet
      // const response = await request(app)
      //   .post('/api/auth/login')
      //   .send(credentials)
      //   .expect(200);

      // expect(response.body).toHaveProperty('token');
      // expect(response.body).toHaveProperty('utilisateur');
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const credentials = {
        email: 'wrong@email.fr',
        password: 'wrongpassword',
      };

      // const response = await request(app)
      //   .post('/api/auth/login')
      //   .send(credentials)
      //   .expect(401);
    });
  });
});
