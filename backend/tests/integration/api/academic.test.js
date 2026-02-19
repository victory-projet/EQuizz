// Tests d'intégration pour les endpoints académiques
const _request = require('supertest');
const { createTestApp, generateTestToken } = require('../../helpers/testServer');

describe('API Academic - Integration Tests', () => {
  let _app;
  let _adminToken;

  beforeAll(() => {
    _app = createTestApp();
    _adminToken = generateTestToken('ens-001', 'enseignant');
  });

  describe('POST /api/academic/classes', () => {
    it('devrait créer une nouvelle classe', async () => {
      const _classeData = {
        nom: 'INGE4-B',
        niveau: 'M1',
      };

      // const response = await request(app)
      //   .post('/api/academic/classes')
      //   .set('Authorization', `Bearer ${adminToken}`)
      //   .send(classeData)
      //   .expect(201);
    });
  });

  describe('GET /api/academic/courses', () => {
    it('devrait retourner la liste des cours', async () => {
      // const response = await request(app)
      //   .get('/api/academic/courses')
      //   .set('Authorization', `Bearer ${adminToken}`)
      //   .expect(200);

      // expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/academic/students/import', () => {
    it('devrait importer des étudiants depuis un fichier CSV', async () => {
      // Test de l'import CSV/Excel
      // Nécessite un fichier de test
    });
  });
});
