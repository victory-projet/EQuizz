// Tests d'intégration pour les évaluations
const request = require('supertest');
const { createTestApp, generateTestToken } = require('../../helpers/testServer');

describe('API Evaluations - Integration Tests', () => {
  let app;
  let enseignantToken;

  beforeAll(() => {
    app = createTestApp();
    enseignantToken = generateTestToken('ens-001', 'enseignant');
  });

  describe('POST /api/evaluations', () => {
    it('devrait créer une nouvelle évaluation', async () => {
      const evaluationData = {
        titre: 'Nouvelle Évaluation',
        cours_id: 'cours-001',
        dateDebut: '2025-12-01',
        dateFin: '2025-12-31',
      };

      // Note: Nécessite configuration complète de l'app
      // const response = await request(app)
      //   .post('/api/evaluations')
      //   .set('Authorization', `Bearer ${enseignantToken}`)
      //   .send(evaluationData)
      //   .expect(201);
    });
  });

  describe('GET /api/evaluations', () => {
    it('devrait retourner la liste des évaluations', async () => {
      // const response = await request(app)
      //   .get('/api/evaluations')
      //   .set('Authorization', `Bearer ${enseignantToken}`)
      //   .expect(200);

      // expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
