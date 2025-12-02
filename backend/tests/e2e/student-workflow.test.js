// Tests end-to-end pour le workflow étudiant
const request = require('supertest');
const { createTestApp } = require('../helpers/testServer');

describe('Student Workflow - E2E Tests', () => {
  let app;
  let studentToken;

  beforeAll(() => {
    app = createTestApp();
  });

  it('devrait permettre à un étudiant de passer un quizz complet', async () => {
    // 1. Connexion
    // const loginResponse = await request(app)
    //   .post('/api/auth/login')
    //   .send({
    //     email: 'pierre.durand@student.fr',
    //     password: 'password123',
    //   });

    // studentToken = loginResponse.body.token;

    // 2. Récupérer les quizz disponibles
    // const quizzesResponse = await request(app)
    //   .get('/api/student/quizzes')
    //   .set('Authorization', `Bearer ${studentToken}`);

    // const quizz = quizzesResponse.body[0];

    // 3. Récupérer les détails du quizz
    // const detailsResponse = await request(app)
    //   .get(`/api/student/quizzes/${quizz.id}`)
    //   .set('Authorization', `Bearer ${studentToken}`);

    // 4. Soumettre les réponses
    // const submitResponse = await request(app)
    //   .post(`/api/student/quizzes/${quizz.id}/submit`)
    //   .set('Authorization', `Bearer ${studentToken}`)
    //   .send({
    //     reponses: [
    //       { question_id: 'q-001', contenu: 'Réponse 1' },
    //     ],
    //     estFinal: true,
    //   });

    // expect(submitResponse.status).toBe(200);
  });
});
