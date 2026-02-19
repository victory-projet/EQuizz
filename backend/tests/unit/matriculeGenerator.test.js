// backend/tests/unit/matriculeGenerator.test.js

const {
  genererMatriculeUniv,
  matriculeExiste,
  validerFormatMatriculeUniv
} = require('../../src/utils/matriculeGenerator');
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

  describe('genererMatriculeUniv', () => {
    afterEach(async () => {
      // Nettoyer les données de test
      await db.Etudiant.destroy({ where: {}, force: true });
      await db.Utilisateur.destroy({ where: {}, force: true });
    });

    test('devrait générer un matricule universitaire au format correct', async () => {
      const matriculeUniv = await genererMatriculeUniv();
      const annee = new Date().getFullYear().toString();
      expect(matriculeUniv).toMatch(new RegExp(`^UNIV-${annee}-\\d{5}$`));
    });

    test('devrait générer des matricules universitaires séquentiels', async () => {
      const matricule1 = await genererMatriculeUniv();
      const annee = new Date().getFullYear().toString();
      expect(matricule1).toBe(`UNIV-${annee}-00001`);

      // Créer un étudiant avec ce matricule
      const utilisateur = await db.Utilisateur.create({
        nom: 'Univ',
        prenom: 'Test',
        email: 'test.univ@saintjeaningenieur.org',
        estActif: true
      });

      await db.Etudiant.create({
        id: utilisateur.id,
        matriculeUniv: matricule1,
        matricule: 'M001'
      });

      const matricule2 = await genererMatriculeUniv();
      expect(matricule2).toBe(`UNIV-${annee}-00002`);
    });
  });

  describe('matriculeExiste', () => {
    afterEach(async () => {
      await db.Etudiant.destroy({ where: {}, force: true });
      await db.Utilisateur.destroy({ where: {}, force: true });
    });

    test('devrait retourner false si le matricule n\'existe pas', async () => {
      const existe = await matriculeExiste('M999');
      expect(existe).toBe(false);
    });

    test('devrait retourner true si le matricule existe', async () => {
      // Créer un étudiant avec un matricule
      const utilisateur = await db.Utilisateur.create({
        nom: 'Test',
        prenom: 'Etudiant',
        email: 'etudiant.test@saintjeaningenieur.org',
        estActif: true
      });

      await db.Etudiant.create({
        id: utilisateur.id,
        matriculeUniv: 'UNIV-2024-00001',
        matricule: 'M001'
      });

      const existe = await matriculeExiste('M001');
      expect(existe).toBe(true);
    });
  });

  describe('validerFormatMatriculeUniv', () => {
    test('devrait valider le format UNIV-ANNEE-NUMERO', () => {
      expect(validerFormatMatriculeUniv('UNIV-2024-00001')).toBe(true);
      expect(validerFormatMatriculeUniv('UNIV-2025-12345')).toBe(true);
    });

    test('devrait rejeter les formats invalides', () => {
      expect(validerFormatMatriculeUniv('UNIV-24-001')).toBe(false);
      expect(validerFormatMatriculeUniv('SJING-2024-001')).toBe(false);
      expect(validerFormatMatriculeUniv('2025001')).toBe(false);
      expect(validerFormatMatriculeUniv('')).toBe(false);
    });
  });
});