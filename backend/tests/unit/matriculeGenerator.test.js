// backend/tests/unit/matriculeGenerator.test.js

const { genererMatricule, genererCodeEcole, extraireAnnee, matriculeExiste } = require('../../src/utils/matriculeGenerator');
const db = require('../../src/models');

describe('Générateur de Matricule', () => {
  
  beforeAll(async () => {
    // Synchroniser la base de données de test
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Fermer la connexion
    await db.sequelize.close();
  });

  describe('genererCodeEcole', () => {
    test('devrait générer un code pour un nom d\'école simple', () => {
      expect(genererCodeEcole('Polytechnique')).toBe('POLYT');
    });

    test('devrait générer un code pour un nom d\'école composé', () => {
      expect(genererCodeEcole('Saint Jean Ingénieur')).toBe('SJING');
    });

    test('devrait générer un code pour un nom d\'école avec plusieurs mots', () => {
      expect(genererCodeEcole('École Nationale Supérieure des Mines')).toBe('ENSM');
    });

    test('devrait ignorer les mots courts', () => {
      expect(genererCodeEcole('École de la Technologie')).toBe('ETEC');
    });
  });

  describe('extraireAnnee', () => {
    test('devrait extraire l\'année de fin d\'une année académique', () => {
      expect(extraireAnnee('2023-2024')).toBe('2024');
    });

    test('devrait extraire l\'année d\'une année simple', () => {
      expect(extraireAnnee('2024')).toBe('2024');
    });

    test('devrait retourner l\'année actuelle si format invalide', () => {
      const anneeActuelle = new Date().getFullYear().toString();
      expect(extraireAnnee('Année invalide')).toBe(anneeActuelle);
    });
  });

  describe('genererMatricule', () => {
    let ecole, anneeAcademique;

    beforeEach(async () => {
      // Créer une école de test
      ecole = await db.Ecole.create({
        nom: 'Saint Jean Ingénieur',
        adresse: '123 Rue Test',
        telephone: '0123456789',
        email: 'test@sjing.org'
      });

      // Créer une année académique de test
      anneeAcademique = await db.AnneeAcademique.create({
        nom: '2023-2024',
        dateDebut: new Date('2023-09-01'),
        dateFin: new Date('2024-08-31')
      });
    });

    afterEach(async () => {
      // Nettoyer les données de test
      await db.Etudiant.destroy({ where: {}, force: true });
      await db.Utilisateur.destroy({ where: {}, force: true });
      await db.AnneeAcademique.destroy({ where: {}, force: true });
      await db.Ecole.destroy({ where: {}, force: true });
    });

    test('devrait générer un matricule au format correct', async () => {
      const matricule = await genererMatricule(ecole.id, anneeAcademique.id);
      expect(matricule).toMatch(/^SJING-2024-\d{3}$/);
    });

    test('devrait générer des matricules séquentiels', async () => {
      const matricule1 = await genererMatricule(ecole.id, anneeAcademique.id);
      expect(matricule1).toBe('SJING-2024-001');

      // Créer un étudiant avec ce matricule
      const utilisateur = await db.Utilisateur.create({
        nom: 'Test',
        prenom: 'Etudiant',
        email: 'test1@sjing.org',
        estActif: true
      });

      await db.Etudiant.create({
        id: utilisateur.id,
        matricule: matricule1
      });

      // Générer le suivant
      const matricule2 = await genererMatricule(ecole.id, anneeAcademique.id);
      expect(matricule2).toBe('SJING-2024-002');
    });

    test('devrait lancer une erreur si l\'école n\'existe pas', async () => {
      await expect(
        genererMatricule('uuid-inexistant', anneeAcademique.id)
      ).rejects.toThrow('École non trouvée');
    });

    test('devrait lancer une erreur si l\'année académique n\'existe pas', async () => {
      await expect(
        genererMatricule(ecole.id, 'uuid-inexistant')
      ).rejects.toThrow('Année académique non trouvée');
    });
  });

  describe('matriculeExiste', () => {
    test('devrait retourner false si le matricule n\'existe pas', async () => {
      const existe = await matriculeExiste('SJING-2024-999');
      expect(existe).toBe(false);
    });

    test('devrait retourner true si le matricule existe', async () => {
      // Créer un étudiant avec un matricule
      const utilisateur = await db.Utilisateur.create({
        nom: 'Test',
        prenom: 'Etudiant',
        email: 'test@sjing.org',
        estActif: true
      });

      await db.Etudiant.create({
        id: utilisateur.id,
        matricule: 'SJING-2024-001'
      });

      const existe = await matriculeExiste('SJING-2024-001');
      expect(existe).toBe(true);
    });
  });
});
