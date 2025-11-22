// backend/tests/integration/evaluation.test.js

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const jwtService = require('../../src/services/jwt.service');
const { setupTestDatabase, cleanupTestDatabase, clearAllTables } = require('../helpers/db-setup');

describe('Evaluation Integration Tests', () => {
  let adminToken;
  let adminUser;
  let cours;
  let classe;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await clearAllTables();

    // Créer un admin de test
    const ecole = await db.Ecole.create({
      nom: 'Test School',
      adresse: '123 Test St'
    });

    adminUser = await db.Utilisateur.create({
      nom: 'Admin',
      prenom: 'Test',
      email: 'admin.test@saintjeaningenieur.org',
      motDePasseHash: 'password123'
    });

    await db.Administrateur.create({
      id: adminUser.id,
      ecole_id: ecole.id
    });

    adminToken = jwtService.generateToken(adminUser);

    // Créer un cours et une classe
    const annee = await db.AnneeAcademique.create({
      libelle: '2024-2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-06-30',
      estCourante: true
    });

    const semestre = await db.Semestre.create({
      nom: 'Semestre 1',
      annee_academique_id: annee.id
    });

    const enseignant = await db.Utilisateur.create({
      nom: 'Prof',
      prenom: 'Test',
      email: 'prof.test@saintjeaningenieur.org',
      motDePasseHash: 'password123'
    });

    await db.Enseignant.create({
      id: enseignant.id,
      specialite: 'Informatique'
    });

    cours = await db.Cours.create({
      code: 'INF305',
      nom: 'Test Course',
      semestre_id: semestre.id,
      enseignant_id: enseignant.id
    });

    classe = await db.Classe.create({
      nom: 'L3 Info',
      niveau: 'L3',
      ecole_id: ecole.id
    });
  });

  describe('POST /api/evaluations', () => {
    
    it('devrait créer une évaluation avec succès', async () => {
      // Act
      const response = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titre: 'Test Evaluation',
          cours_id: cours.id,
          classeIds: [classe.id],
          dateDebut: '2024-11-20T00:00:00Z',
          dateFin: '2024-12-15T23:59:59Z'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.titre).toBe('Test Evaluation');
      expect(response.body.statut).toBe('BROUILLON');
      expect(response.body).toHaveProperty('Quizz');
    });

    it('devrait rejeter sans authentification', async () => {
      // Act
      const response = await request(app)
        .post('/api/evaluations')
        .send({
          titre: 'Test Evaluation',
          cours_id: cours.id,
          classeIds: [classe.id]
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('devrait valider les champs requis', async () => {
      // Act
      const response = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titre: 'Test Evaluation'
          // Manque cours_id et classeIds
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/evaluations/quizz/:quizzId/questions', () => {
    
    it('devrait ajouter une question à un quizz', async () => {
      // Arrange
      const evaluation = await db.Evaluation.create({
        titre: 'Test Eval',
        cours_id: cours.id,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        administrateur_id: adminUser.id
      });

      const quizz = await db.Quizz.create({
        titre: 'Test Quizz',
        evaluation_id: evaluation.id
      });

      // Act
      const response = await request(app)
        .post(`/api/evaluations/quizz/${quizz.id}/questions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          enonce: 'Comment évaluez-vous ce cours ?',
          typeQuestion: 'CHOIX_MULTIPLE',
          options: ['Excellent', 'Bien', 'Moyen', 'Insuffisant']
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.enonce).toBe('Comment évaluez-vous ce cours ?');
      expect(response.body.typeQuestion).toBe('CHOIX_MULTIPLE');
      expect(response.body.options).toHaveLength(4);
    });
  });

  describe('POST /api/evaluations/:id/publish', () => {
    
    it('devrait publier une évaluation avec des questions', async () => {
      // Arrange
      const evaluation = await db.Evaluation.create({
        titre: 'Test Eval',
        cours_id: cours.id,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        administrateur_id: adminUser.id,
        statut: 'BROUILLON'
      });

      const quizz = await db.Quizz.create({
        titre: 'Test Quizz',
        evaluation_id: evaluation.id
      });

      await db.Question.create({
        enonce: 'Test question',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: quizz.id
      });

      await evaluation.addClasse(classe);

      // Act
      const response = await request(app)
        .post(`/api/evaluations/${evaluation.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.evaluation.statut).toBe('PUBLIEE');
    });

    it('devrait rejeter la publication sans questions', async () => {
      // Arrange
      const evaluation = await db.Evaluation.create({
        titre: 'Test Eval',
        cours_id: cours.id,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 86400000),
        administrateur_id: adminUser.id,
        statut: 'BROUILLON'
      });

      await db.Quizz.create({
        titre: 'Test Quizz',
        evaluation_id: evaluation.id
      });

      // Act
      const response = await request(app)
        .post(`/api/evaluations/${evaluation.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
