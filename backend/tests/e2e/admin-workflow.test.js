// Tests end-to-end pour le workflow administrateur
const request = require('supertest');
const { createTestApp } = require('../helpers/testServer');

describe('Admin Workflow - E2E Tests', () => {
  let app;
  let adminToken;

  beforeAll(() => {
    app = createTestApp();
  });

  it('devrait permettre de créer une évaluation complète', async () => {
    // 1. Connexion enseignant
    // const loginResponse = await request(app)
    //   .post('/api/auth/login')
    //   .send({
    //     email: 'jean.dupont@ecole.fr',
    //     password: 'password123',
    //   });

    // adminToken = loginResponse.body.token;

    // 2. Créer une évaluation
    // const evalResponse = await request(app)
    //   .post('/api/evaluations')
    //   .set('Authorization', `Bearer ${adminToken}`)
    //   .send({
    //     titre: 'Test Évaluation',
    //     cours_id: 'cours-001',
    //     dateDebut: '2025-12-01',
    //     dateFin: '2025-12-31',
    //   });

    // const evaluationId = evalResponse.body.id;

    // 3. Ajouter des questions
    // await request(app)
    //   .post(`/api/evaluations/${evaluationId}/questions`)
    //   .set('Authorization', `Bearer ${adminToken}`)
    //   .send({
    //     enonce: 'Question test',
    //     typeQuestion: 'QCM',
    //     options: [
    //       { texte: 'Option 1', estCorrecte: true },
    //       { texte: 'Option 2', estCorrecte: false },
    //     ],
    //   });

    // 4. Publier l'évaluation
    // await request(app)
    //   .patch(`/api/evaluations/${evaluationId}`)
    //   .set('Authorization', `Bearer ${adminToken}`)
    //   .send({ estPubliee: true });
  });
});
