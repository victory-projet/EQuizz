// Tests unitaires pour le repository de quizz
const quizzRepository = require('../../../src/repositories/quizz.repository');
const db = require('../../../src/models');

jest.mock('../../../src/models');

describe('QuizzRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAvailableEvaluationsForClass()', () => {
    it('devrait retourner les évaluations disponibles pour une classe', async () => {
      const mockEvaluations = [
        {
          id: 'eval-001',
          titre: 'Évaluation JS',
          estPubliee: true,
          toJSON: jest.fn().mockReturnValue({
            id: 'eval-001',
            titre: 'Évaluation JS',
          }),
        },
      ];

      db.Evaluation = {
        findAll: jest.fn().mockResolvedValue(mockEvaluations),
      };

      db.SessionToken = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const result = await quizzRepository.findAvailableEvaluationsForClass(
        'classe-001',
        'etu-001'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findQuizzWithQuestionsById()', () => {
    it('devrait retourner un quizz avec ses questions', async () => {
      const mockQuizz = {
        id: 'quizz-001',
        titre: 'Quiz Test',
        Questions: [
          { id: 'q-001', enonce: 'Question 1' },
        ],
      };

      db.Quizz = {
        findByPk: jest.fn().mockResolvedValue(mockQuizz),
      };

      const result = await quizzRepository.findQuizzWithQuestionsById('quizz-001');

      expect(result).toEqual(mockQuizz);
    });
  });
});
