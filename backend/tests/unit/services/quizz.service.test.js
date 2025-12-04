// Tests unitaires pour le service de quizz
const quizzService = require('../../../src/services/quizz.service');
const db = require('../../../src/models');

jest.mock('../../../src/models');
jest.mock('../../../src/repositories/quizz.repository');
jest.mock('../../../src/repositories/etudiant.repository');

describe('QuizzService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableQuizzesForStudent()', () => {
    it('devrait retourner les quizz disponibles pour un étudiant', async () => {
      const etudiantRepository = require('../../../src/repositories/etudiant.repository');
      const quizzRepository = require('../../../src/repositories/quizz.repository');

      const mockEtudiant = {
        id: 'etu-001',
        classe_id: 'classe-001',
      };

      const mockEvaluations = [
        {
          id: 'eval-001',
          titre: 'Évaluation JS',
        },
      ];

      etudiantRepository.findById = jest.fn().mockResolvedValue(mockEtudiant);
      quizzRepository.findAvailableEvaluationsForClass = jest.fn().mockResolvedValue(mockEvaluations);

      const result = await quizzService.getAvailableQuizzesForStudent('etu-001');

      expect(result).toEqual(mockEvaluations);
      expect(etudiantRepository.findById).toHaveBeenCalledWith('etu-001');
    });

    it('devrait lever une erreur si étudiant non trouvé', async () => {
      const etudiantRepository = require('../../../src/repositories/etudiant.repository');
      
      etudiantRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        quizzService.getAvailableQuizzesForStudent('non-existant')
      ).rejects.toThrow('Profil étudiant non trouvé');
    });
  });

  describe('submitReponses() - Système d\'anonymat', () => {
    const mockTransactionImplementation = () => {
      return jest.fn().mockImplementation(async (callback) => {
        const t = { commit: jest.fn(), rollback: jest.fn() };
        await callback(t);
        return t;
      });
    };

    it.skip('devrait créer un token anonyme pour la première soumission', async () => {
      // Test nécessite un mock complexe de transaction Sequelize
      // À implémenter avec une vraie base de données de test
    });

    it.skip('devrait réutiliser le token anonyme existant', async () => {
      // Test nécessite un mock complexe de transaction Sequelize
      // À implémenter avec une vraie base de données de test
    });

    it.skip('devrait marquer la session comme terminée si estFinal=true', async () => {
      // Test nécessite un mock complexe de transaction Sequelize
      // À implémenter avec une vraie base de données de test
    });
  });

  describe('getQuizzDetails()', () => {
    it('devrait retourner les détails du quizz avec questions', async () => {
      const quizzRepository = require('../../../src/repositories/quizz.repository');
      
      const mockQuizz = {
        id: 'quizz-001',
        titre: 'Quiz Test',
        evaluation_id: 'eval-001',
        Questions: [],
        toJSON: jest.fn().mockReturnValue({
          id: 'quizz-001',
          titre: 'Quiz Test',
          Questions: [],
        }),
      };

      quizzRepository.findQuizzWithQuestionsById = jest.fn().mockResolvedValue(mockQuizz);
      
      db.SessionToken = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const result = await quizzService.getQuizzDetails('quizz-001', 'etu-001');

      expect(result).toBeDefined();
      expect(result.tokenAnonyme).toBeNull();
    });
  });
});
