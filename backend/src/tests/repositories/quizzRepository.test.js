// tests/repositories/quizzRepository.test.js
const QuizzRepository = require('../../repositories/quizz.repository');
const Quizz = require('../../models/Quizz'); // Le modèle Sequelize

// Simule le modèle Sequelize Quizz
jest.mock('../../models/Quizz.js');

describe('QuizzRepository', () => {
  beforeEach(() => {
    // Réinitialise les mocks avant chaque test
    jest.clearAllMocks(); 
  });

  test('create devrait appeler Quizz.create avec les bonnes données', async () => {
    const mockData = { titre: 'Test', instructions: 'Instructions' };
    // Configure le mock pour qu'il retourne une valeur simulée
    Quizz.create.mockResolvedValue(mockData); 

    const result = await QuizzRepository.create(mockData);

    expect(Quizz.create).toHaveBeenCalledTimes(1);
    expect(Quizz.create).toHaveBeenCalledWith(mockData);
    expect(result).toEqual(mockData);
  });

  test('count devrait appeler Quizz.count et retourner le nombre', async () => {
    const mockCount = 10;
    Quizz.count.mockResolvedValue(mockCount);

    const result = await QuizzRepository.count();

    expect(Quizz.count).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockCount);
  });
});
