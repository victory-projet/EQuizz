// tests/integration/quizzApi.test.js
const request = require('supertest');
const app = require('../../../app'); // Importe votre instance Express
const quizzRepository = require('../../repositories/quizz.repository');

// Nous pouvons toujours mocker le repository pour éviter de toucher à la vraie DB pendant les tests d'API
jest.mock('../../repositories/quizz.repository.js');

describe('Quizz API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/quizzs devrait créer un quizz', async () => {
    const quizzData = { titre: 'API Test', instructions: 'Via Supertest' };
    quizzRepository.create.mockResolvedValue({ id: 'uuid-123', ...quizzData });

    const response = await request(app)
      .post('/api/quizzs')
      .send(quizzData)
      .expect('Content-Type', /json/)
      .expect(201); // S'attendre à un statut 201 Created

    expect(response.body.titre).toBe(quizzData.titre);
    expect(quizzRepository.create).toHaveBeenCalledTimes(1);
  });

  test('GET /api/quizzs/count devrait retourner le nombre total', async () => {
    quizzRepository.count.mockResolvedValue(5);

    const response = await request(app)
      .get('/api/quizzs/count')
      .expect('Content-Type', /json/)
      .expect(200); // S'attendre à un statut 200 OK

    expect(response.body.totalQuizzs).toBe(5);
    expect(quizzRepository.count).toHaveBeenCalledTimes(1);
  });
});
