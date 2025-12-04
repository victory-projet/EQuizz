// Tests unitaires pour le service d'évaluation
const evaluationService = require('../../../src/services/evaluation.service');
const db = require('../../../src/models');

// Mock des modèles Sequelize
jest.mock('../../../src/models');
jest.mock('../../../src/repositories/evaluation.repository');
jest.mock('../../../src/repositories/cours.repository');
jest.mock('../../../src/repositories/question.repository');

describe('EvaluationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it.skip('devrait créer une évaluation avec un quizz associé', async () => {
      // Test nécessite un mock complexe de transaction Sequelize
      // À implémenter avec une vraie base de données de test
    });

    it('devrait lever une erreur si cours_id est manquant', async () => {
      const data = {
        titre: 'Test Evaluation',
        dateDebut: '2025-11-01',
        dateFin: '2025-11-30',
      };

      await expect(evaluationService.create(data)).rejects.toThrow();
    });
  });

  describe('addQuestionToQuizz()', () => {
    it('devrait ajouter une question QCM avec options', async () => {
      const questionRepository = require('../../../src/repositories/question.repository');

      const mockQuestion = {
        id: 'q-001',
        enonce: 'Question test',
        typeQuestion: 'QCM',
      };

      questionRepository.create = jest.fn().mockResolvedValue(mockQuestion);

      const questionData = {
        enonce: 'Question test',
        typeQuestion: 'QCM',
        options: ['Option 1', 'Option 2'],
      };

      const result = await evaluationService.addQuestionToQuizz('quizz-001', questionData);

      expect(questionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          enonce: questionData.enonce,
          typeQuestion: questionData.typeQuestion,
          quizz_id: 'quizz-001',
        })
      );
      expect(result).toEqual(mockQuestion);
    });

    it('devrait ajouter une question ouverte sans options', async () => {
      const questionRepository = require('../../../src/repositories/question.repository');

      const mockQuestion = {
        id: 'q-002',
        enonce: 'Question ouverte',
        typeQuestion: 'OUVERTE',
      };

      questionRepository.create = jest.fn().mockResolvedValue(mockQuestion);

      const questionData = {
        enonce: 'Question ouverte',
        typeQuestion: 'OUVERTE',
      };

      const result = await evaluationService.addQuestionToQuizz('quizz-001', questionData);

      expect(questionRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('findAll()', () => {
    it('devrait retourner toutes les évaluations', async () => {
      const evaluationRepository = require('../../../src/repositories/evaluation.repository');

      const mockEvaluations = [
        { id: 'eval-001', titre: 'Eval 1' },
        { id: 'eval-002', titre: 'Eval 2' },
      ];

      evaluationRepository.findAll = jest.fn().mockResolvedValue(mockEvaluations);

      const result = await evaluationService.findAll();

      expect(result).toEqual(mockEvaluations);
      expect(evaluationRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('devrait retourner une évaluation par ID', async () => {
      const evaluationRepository = require('../../../src/repositories/evaluation.repository');

      const mockEvaluation = {
        id: 'eval-001',
        titre: 'Test Evaluation',
      };

      evaluationRepository.findById = jest.fn().mockResolvedValue(mockEvaluation);

      const result = await evaluationService.findOne('eval-001');

      expect(result).toEqual(mockEvaluation);
      expect(evaluationRepository.findById).toHaveBeenCalledWith('eval-001');
    });

    it('devrait lever une erreur si évaluation non trouvée', async () => {
      const evaluationRepository = require('../../../src/repositories/evaluation.repository');

      evaluationRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(evaluationService.findOne('non-existant')).rejects.toThrow('Évaluation non trouvée');
    });
  });
});
