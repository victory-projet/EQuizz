// Tests unitaires pour l'import Excel d'étudiants
const etudiantImportService = require('../../../src/services/etudiant-import.service');
const ExcelJS = require('exceljs');
const db = require('../../../src/models');

jest.mock('../../../src/models');
jest.mock('../../../src/utils/matriculeGenerator');

describe('Import Excel Étudiants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importFromExcel()', () => {
    it('devrait créer de nouveaux étudiants', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Etudiants');

      worksheet.columns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Prenom', key: 'prenom' },
        { header: 'Email', key: 'email' },
        { header: 'Matricule', key: 'matricule' },
        { header: 'IdCarte', key: 'idCarte' },
        { header: 'Classe', key: 'classe' },
        { header: 'Action', key: 'action' }
      ];

      worksheet.addRow({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.com',
        matricule: '2025001',
        idCarte: 'CARD001',
        classe: 'L1-INFO',
        action: 'CREATE'
      });

      const buffer = await workbook.xlsx.writeBuffer();

      db.sequelize = {
        transaction: jest.fn().mockResolvedValue({
          commit: jest.fn(),
          rollback: jest.fn()
        })
      };

      db.Classe.findOne = jest.fn().mockResolvedValue({
        id: 'classe-001',
        nom: 'L1-INFO',
        ecole_id: 'ecole-001',
        anneeAcademiqueId: 'annee-001'
      });

      db.Classe.findByPk = jest.fn().mockResolvedValue({
        id: 'classe-001',
        nom: 'L1-INFO',
        ecole_id: 'ecole-001',
        anneeAcademiqueId: 'annee-001',
        Ecole: { id: 'ecole-001' },
        AnneeAcademique: { id: 'annee-001' }
      });

      db.Utilisateur.findOne = jest.fn().mockResolvedValue(null);
      db.Etudiant.findOne = jest.fn().mockResolvedValue(null);

      db.Utilisateur.create = jest.fn().mockResolvedValue({
        id: 'user-001',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.com'
      });

      db.Etudiant.create = jest.fn().mockResolvedValue({
        id: 'user-001',
        matricule: '2025001',
        idCarte: 'CARD001',
        classe_id: 'classe-001'
      });

      db.HistoriqueEtudiant.create = jest.fn().mockResolvedValue({});

      const result = await etudiantImportService.importFromExcel(buffer, null);

      expect(result.stats.created).toBe(1);
      expect(result.stats.errors).toBe(0);
    });

    it('devrait rejeter un fichier Excel vide', async () => {
      const workbook = new ExcelJS.Workbook();
      const buffer = await workbook.xlsx.writeBuffer();

      await expect(
        etudiantImportService.importFromExcel(buffer, null)
      ).rejects.toThrow('Le fichier Excel est vide ou invalide');
    });

    it('devrait valider les champs obligatoires', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Etudiants');

      worksheet.columns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Prenom', key: 'prenom' },
        { header: 'Email', key: 'email' }
      ];

      worksheet.addRow({
        nom: 'Dupont',
        prenom: '',
        email: 'jean.dupont@test.com'
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await etudiantImportService.importFromExcel(buffer, 'classe-001');

      expect(result.stats.errors).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('obligatoires');
    });
  });

  describe('validateExcel()', () => {
    it('devrait valider un fichier Excel correct', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Etudiants');

      worksheet.columns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Prenom', key: 'prenom' },
        { header: 'Email', key: 'email' }
      ];

      worksheet.addRow({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.com'
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await etudiantImportService.validateExcel(buffer, 'classe-001');

      expect(result.valid.length).toBe(1);
      expect(result.errors.length).toBe(0);
    });

    it('devrait détecter les erreurs de validation', async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Etudiants');

      worksheet.columns = [
        { header: 'Nom', key: 'nom' },
        { header: 'Prenom', key: 'prenom' },
        { header: 'Email', key: 'email' }
      ];

      worksheet.addRow({
        nom: '',
        prenom: 'Jean',
        email: 'invalid-email'
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const result = await etudiantImportService.validateExcel(buffer, 'classe-001');

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
