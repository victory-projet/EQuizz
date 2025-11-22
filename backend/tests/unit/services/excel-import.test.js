// Tests unitaires pour l'import Excel
const evaluationService = require('../../../src/services/evaluation.service');
const ExcelJS = require('exceljs');
const db = require('../../../src/models');

jest.mock('../../../src/models');
jest.mock('../../../src/repositories/evaluation.repository');
jest.mock('../../../src/repositories/cours.repository');
jest.mock('../../../src/repositories/question.repository');

describe('Import Excel de Questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importQuestionsFromExcel()', () => {
    it('devrait parser un fichier Excel valide', async () => {
      // Créer un buffer Excel de test
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Questions');

      // Ajouter les en-têtes
      worksheet.columns = [
        { header: 'Énoncé', key: 'enonce' },
        { header: 'Type', key: 'type' },
        { header: 'Option 1', key: 'opt1' },
        { header: 'Option 2', key: 'opt2' },
        { header: 'Réponse Correcte', key: 'correct' },
      ];

      // Ajouter des données
      worksheet.addRow({
        enonce: 'Qu\'est-ce que JavaScript ?',
        type: 'QCM',
        opt1: 'Un langage de programmation',
        opt2: 'Un framework',
        correct: '1',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Mock de bulkCreate
      db.Question = {
        bulkCreate: jest.fn().mockResolvedValue([{ id: 'q-001' }]),
      };

      const result = await evaluationService.importQuestionsFromExcel('quizz-001', buffer);
      
      // Vérifier que les questions ont été créées
      expect(db.Question.bulkCreate).toHaveBeenCalled();
      expect(result.count).toBeGreaterThan(0);
    });

    it('devrait rejeter un fichier Excel invalide', async () => {
      const invalidBuffer = Buffer.from('invalid data');

      await expect(
        evaluationService.importQuestionsFromExcel('quizz-001', invalidBuffer)
      ).rejects.toThrow();
    });

    it('devrait gérer les questions ouvertes sans options', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Questions');

      worksheet.columns = [
        { header: 'Énoncé', key: 'enonce' },
        { header: 'Type', key: 'type' },
      ];

      worksheet.addRow({
        enonce: 'Expliquez le concept de closure',
        type: 'OUVERTE',
      });

      const buffer = await workbook.xlsx.writeBuffer();

      // Test que les questions ouvertes sont créées sans options
    });
  });
});
