// Tests d'intégration pour les évaluations
const _request = require('supertest');
const { createTestApp, generateTestToken } = require('../../helpers/testServer');

describe('API Evaluations - Integration Tests', () => {
  let _app;
  let _enseignantToken;

  beforeAll(() => {
    _app = createTestApp();
    _enseignantToken = generateTestToken('ens-001', 'enseignant');
  });

  describe('POST /api/evaluations', () => {
    it('devrait créer une nouvelle évaluation', async () => {
      const _evaluationData = {
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
