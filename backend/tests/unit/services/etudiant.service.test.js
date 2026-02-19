// backend/tests/unit/services/etudiant.service.test.js

const etudiantService = require('../../../src/services/etudiant.service');
const db = require('../../../src/models');
const AppError = require('../../../src/utils/AppError');
const { genererMatricule } = require('../../../src/utils/matriculeGenerator');

// Mock des modèles et utilitaires
jest.mock('../../../src/models');
jest.mock('../../../src/utils/matriculeGenerator');

describe('EtudiantService - Transfert', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de la transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    
    db.sequelize = {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    };
  });

  describe('transferer()', () => {
    const etudiantId = 'etudiant-uuid-123';
    const ancienneClasseId = 'classe-uuid-1';
    const nouvelleClasseId = 'classe-uuid-2';
    const ancienneEcoleId = 'ecole-uuid-1';
    const nouvelleEcoleId = 'ecole-uuid-2';

    const mockEtudiant = {
      id: etudiantId,
      matricule: 'SJING-2024-001',
      classe_id: ancienneClasseId,
      Classe: {
        id: ancienneClasseId,
        ecole_id: ancienneEcoleId,
        nom: 'ING4-A'
      },
      update: jest.fn()
    };

    const mockNouvelleClasse = {
      id: nouvelleClasseId,
      ecole_id: nouvelleEcoleId,
      nom: 'ING5-B',
      anneeAcademiqueId: 'annee-uuid-1',
      Ecole: {
        id: nouvelleEcoleId,
        nom: 'Polytechnique'
      },
      AnneeAcademique: {
        id: 'annee-uuid-1',
        nom: '2024-2025'
      }
    };

    beforeEach(() => {
      db.Etudiant = {
        findByPk: jest.fn()
      };
      db.Classe = {
        findByPk: jest.fn()
      };
      db.HistoriqueEtudiant = {
        update: jest.fn(),
        create: jest.fn()
      };
    });

    it('devrait rejeter si l\'étudiant n\'existe pas', async () => {
      db.Etudiant.findByPk.mockResolvedValue(null);

      await expect(
        etudiantService.transferer(etudiantId, nouvelleClasseId)
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si la nouvelle classe n\'est pas fournie', async () => {
      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);

      await expect(
        etudiantService.transferer(etudiantId, null)
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si l\'étudiant est déjà dans cette classe', async () => {
      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);

      await expect(
        etudiantService.transferer(etudiantId, ancienneClasseId)
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si la nouvelle classe n\'existe pas', async () => {
      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);
      db.Classe.findByPk.mockResolvedValue(null);

      await expect(
        etudiantService.transferer(etudiantId, nouvelleClasseId)
      ).rejects.toThrow(AppError);
    });

    it('devrait transférer un étudiant vers une nouvelle école avec nouveau matricule', async () => {
      const nouveauMatricule = 'POLYTECH-2024-015';
      const dateTransfert = new Date('2024-09-01');

      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);
      db.Classe.findByPk.mockResolvedValue(mockNouvelleClasse);
      genererMatricule.mockResolvedValue(nouveauMatricule);
      
      mockEtudiant.update.mockResolvedValue(mockEtudiant);
      db.HistoriqueEtudiant.update.mockResolvedValue([1]);
      db.HistoriqueEtudiant.create.mockResolvedValue({
        id: 'hist-uuid-2',
        etudiant_id: etudiantId,
        matricule: nouveauMatricule,
        ecole_id: nouvelleEcoleId,
        classe_id: nouvelleClasseId,
        dateDebut: dateTransfert,
        dateFin: null,
        estPeriodeActuelle: true
      });

      // Mock des méthodes du service
      etudiantService.findOne = jest.fn().mockResolvedValue(mockEtudiant);
      etudiantService.getHistorique = jest.fn().mockResolvedValue([]);

      const resultat = await etudiantService.transferer(
        etudiantId, 
        nouvelleClasseId, 
        dateTransfert
      );

      // Vérifications
      expect(db.HistoriqueEtudiant.update).toHaveBeenCalledWith(
        {
          dateFin: dateTransfert,
          estPeriodeActuelle: false
        },
        {
          where: {
            etudiant_id: etudiantId,
            estPeriodeActuelle: true
          },
          transaction: mockTransaction
        }
      );

      expect(genererMatricule).toHaveBeenCalledWith(
        nouvelleEcoleId,
        mockNouvelleClasse.anneeAcademiqueId
      );

      expect(mockEtudiant.update).toHaveBeenCalledWith(
        {
          matricule: nouveauMatricule,
          classe_id: nouvelleClasseId
        },
        { transaction: mockTransaction }
      );

      expect(db.HistoriqueEtudiant.create).toHaveBeenCalledWith(
        {
          etudiant_id: etudiantId,
          matricule: nouveauMatricule,
          ecole_id: nouvelleEcoleId,
          classe_id: nouvelleClasseId,
          dateDebut: dateTransfert,
          dateFin: null,
          estPeriodeActuelle: true
        },
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultat.transfert.estChangementEcole).toBe(true);
      expect(resultat.transfert.nouveauMatricule).toBe(nouveauMatricule);
    });

    it('devrait transférer un étudiant dans la même école sans changer le matricule', async () => {
      const memeEcoleClasse = {
        ...mockNouvelleClasse,
        ecole_id: ancienneEcoleId // Même école
      };

      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);
      db.Classe.findByPk.mockResolvedValue(memeEcoleClasse);
      
      mockEtudiant.update.mockResolvedValue(mockEtudiant);
      db.HistoriqueEtudiant.update.mockResolvedValue([1]);
      db.HistoriqueEtudiant.create.mockResolvedValue({});

      etudiantService.findOne = jest.fn().mockResolvedValue(mockEtudiant);
      etudiantService.getHistorique = jest.fn().mockResolvedValue([]);

      const resultat = await etudiantService.transferer(
        etudiantId, 
        nouvelleClasseId
      );

      // Le matricule ne devrait pas changer
      expect(genererMatricule).not.toHaveBeenCalled();
      expect(mockEtudiant.update).toHaveBeenCalledWith(
        {
          matricule: mockEtudiant.matricule, // Même matricule
          classe_id: nouvelleClasseId
        },
        { transaction: mockTransaction }
      );

      expect(resultat.transfert.estChangementEcole).toBe(false);
      expect(resultat.transfert.ancienMatricule).toBeNull();
    });

    it('devrait rollback la transaction en cas d\'erreur', async () => {
      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);
      db.Classe.findByPk.mockResolvedValue(mockNouvelleClasse);
      db.HistoriqueEtudiant.update.mockRejectedValue(new Error('Database error'));

      await expect(
        etudiantService.transferer(etudiantId, nouvelleClasseId)
      ).rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('devrait utiliser la date actuelle si aucune date n\'est fournie', async () => {
      const maintenant = new Date();
      
      db.Etudiant.findByPk.mockResolvedValue(mockEtudiant);
      db.Classe.findByPk.mockResolvedValue(mockNouvelleClasse);
      genererMatricule.mockResolvedValue('POLYTECH-2024-015');
      
      mockEtudiant.update.mockResolvedValue(mockEtudiant);
      db.HistoriqueEtudiant.update.mockResolvedValue([1]);
      db.HistoriqueEtudiant.create.mockResolvedValue({});

      etudiantService.findOne = jest.fn().mockResolvedValue(mockEtudiant);
      etudiantService.getHistorique = jest.fn().mockResolvedValue([]);

      await etudiantService.transferer(etudiantId, nouvelleClasseId);

      const callArgs = db.HistoriqueEtudiant.update.mock.calls[0][0];
      expect(callArgs.dateFin).toBeInstanceOf(Date);
      expect(callArgs.dateFin.getTime()).toBeGreaterThanOrEqual(maintenant.getTime() - 1000);
    });
  });
});
