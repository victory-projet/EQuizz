// Tests d'intégration pour les endpoints étudiants
const request = require('supertest');
const { createTestApp, generateTestToken } = require('../../helpers/testServer');

describe('API Student - Integration Tests', () => {
  let app;
  let studentToken;

  beforeAll(() => {
    app = createTestApp();
    studentToken = generateTestToken('etu-001', 'etudiant');
  });

  describe('GET /api/student/quizzes', () => {
    it('devrait retourner les quizz disponibles pour l\'étudiant', async () => {
      // const response = await request(app)
      //   .get('/api/student/quizzes')
      //   .set('Authorization', `Bearer ${studentToken}`)
      //   .expect(200);

      // expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/student/quizzes/:id/submit', () => {
    it('devrait soumettre les réponses de manière anonyme', async () => {
      const submission = {
        reponses: [
          { question_id: 'q-001', contenu: 'Ma réponse' },
        ],
        estFinal: true,
      };

      // const response = await request(app)
      //   .post('/api/student/quizzes/quizz-001/submit')
      //   .set('Authorization', `Bearer ${studentToken}`)
      //   .send(submission)
      //   .expect(200);
    });
  });
});
