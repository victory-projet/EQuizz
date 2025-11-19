// tests/services/quizzService.test.js
const quizzService = require('../../services/quizz.service');
// Simule le module repository entier
const quizzRepository = require('../../repositories/quizz.repository');

jest.mock('../../repositories/quizz.repository.js');

describe('QuizzService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createNewQuizz devrait créer un quizz valide', async () => {
    const data = { titre: 'Nouveau Quizz', instructions: 'Test' };
    // S'assurer que le repository.create est bien appelé et réussi
    quizzRepository.create.mockResolvedValue(data);

    const result = await quizzService.createNewQuizz(data);

    expect(quizzRepository.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
  });

  test('createNewQuizz devrait échouer si le titre est manquant', async () => {
    const data = { instructions: 'Test' }; // Pas de titre

    // On s'attend à ce que cette fonction lève une erreur
    await expect(quizzService.createNewQuizz(data)).rejects.toThrow('Le titre du quizz est obligatoire.');
    // S'assurer que le repository n'a JAMAIS été appelé
    expect(quizzRepository.create).not.toHaveBeenCalled();
  });
});
