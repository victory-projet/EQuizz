// backend/tests/e2e/complete-workflow.test.js
// Test du workflow complet: Création → Publication → Réponse → Rapport

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const jwtService = require('../../src/services/jwt.service');
const { setupTestDatabase, cleanupTestDatabase, clearAllTables } = require('../helpers/db-setup');

describe('Complete Workflow E2E Tests', () => {
  let adminToken, etudiantToken;
  let adminUser, etudiantUser;
  let cours, classe, evaluation, quizz;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await clearAllTables();
    // Setup complet de l'environnement de test
    
    // 1. Créer l'école
    const ecole = await db.Ecole.create({
      nom: 'Test School',
      adresse: '123 Test St'
    });

    // 2. Créer l'admin
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

    // 3. Créer la structure académique
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

    // 4. Créer un étudiant
    etudiantUser = await db.Utilisateur.create({
      nom: 'Etudiant',
      prenom: 'Test',
      email: 'etudiant.test@saintjeaningenieur.org',
      motDePasseHash: 'password123'
    });

    await db.Etudiant.create({
      id: etudiantUser.id,
      matricule: '20230001',
      classe_id: classe.id
    });

    etudiantToken = jwtService.generateToken(etudiantUser);
  });

  describe('Workflow Complet: Évaluation', () => {
    
    it('devrait exécuter le workflow complet avec succès', async () => {
      
      // ========================================
      // ÉTAPE 1: Admin crée une évaluation
      // ========================================
      const createEvalResponse = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          titre: 'Évaluation E2E Test',
          cours_id: cours.id,
          classeIds: [classe.id],
          dateDebut: new Date().toISOString(),
          dateFin: new Date(Date.now() + 86400000).toISOString()
        });

      expect(createEvalResponse.status).toBe(201);
      evaluation = createEvalResponse.body;
      quizz = evaluation.Quizz;

      console.log('✅ Étape 1: Évaluation créée');

      // ========================================
      // ÉTAPE 2: Admin ajoute des questions
      // ========================================
      const question1Response = await request(app)
        .post(`/api/evaluations/quizz/${quizz.id}/questions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          enonce: 'Comment évaluez-vous ce cours ?',
          typeQuestion: 'CHOIX_MULTIPLE',
          options: ['Excellent', 'Bien', 'Moyen', 'Insuffisant']
        });

      expect(question1Response.status).toBe(201);

      const question2Response = await request(app)
        .post(`/api/evaluations/quizz/${quizz.id}/questions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          enonce: 'Qu\'avez-vous apprécié dans ce cours ?',
          typeQuestion: 'REPONSE_OUVERTE'
        });

      expect(question2Response.status).toBe(201);

      console.log('✅ Étape 2: Questions ajoutées');

      // ========================================
      // ÉTAPE 3: Admin publie l'évaluation
      // ========================================
      const publishResponse = await request(app)
        .post(`/api/evaluations/${evaluation.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(publishResponse.status).toBe(200);
      expect(publishResponse.body.evaluation.statut).toBe('PUBLIEE');

      console.log('✅ Étape 3: Évaluation publiée');

      // ========================================
      // ÉTAPE 4: Étudiant consulte ses quizz
      // ========================================
      const getQuizzesResponse = await request(app)
        .get('/api/student/quizzes')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(getQuizzesResponse.status).toBe(200);
      expect(getQuizzesResponse.body).toHaveLength(1);
      expect(getQuizzesResponse.body[0].statut).toBe('NOUVEAU');

      console.log('✅ Étape 4: Étudiant voit le quizz');

      // ========================================
      // ÉTAPE 5: Étudiant consulte le détail
      // ========================================
      const getQuizzDetailResponse = await request(app)
        .get(`/api/student/quizzes/${quizz.id}`)
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(getQuizzDetailResponse.status).toBe(200);
      expect(getQuizzDetailResponse.body.questions).toHaveLength(2);

      console.log('✅ Étape 5: Détails du quizz récupérés');

      // ========================================
      // ÉTAPE 6: Étudiant répond au quizz
      // ========================================
      const questions = getQuizzDetailResponse.body.questions;

      const submitResponse = await request(app)
        .post(`/api/student/quizzes/${quizz.id}/submit`)
        .set('Authorization', `Bearer ${etudiantToken}`)
        .send({
          reponses: [
            {
              question_id: questions[0].id,
              contenu: 'Excellent'
            },
            {
              question_id: questions[1].id,
              contenu: 'Le cours était très intéressant et bien structuré.'
            }
          ],
          estFinal: true
        });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.message).toContain('soumises avec succès');

      console.log('✅ Étape 6: Réponses soumises');

      // ========================================
      // ÉTAPE 7: Admin consulte le dashboard
      // ========================================
      const dashboardResponse = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body).toHaveProperty('overview');
      expect(dashboardResponse.body.overview.totalEvaluations).toBeGreaterThan(0);

      console.log('✅ Étape 7: Dashboard consulté');

      // ========================================
      // ÉTAPE 8: Admin génère un rapport
      // ========================================
      const reportResponse = await request(app)
        .get(`/api/reports/${evaluation.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.body).toHaveProperty('evaluation');
      expect(reportResponse.body).toHaveProperty('statistics');
      expect(reportResponse.body).toHaveProperty('sentimentAnalysis');
      expect(reportResponse.body).toHaveProperty('questions');

      // Vérifier les statistiques
      expect(reportResponse.body.statistics.nombreRepondants).toBe(1);
      expect(reportResponse.body.statistics.tauxParticipation).toBeGreaterThan(0);

      console.log('✅ Étape 8: Rapport généré');

      // ========================================
      // ÉTAPE 9: Admin exporte en PDF
      // ========================================
      const pdfResponse = await request(app)
        .get(`/api/reports/${evaluation.id}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pdfResponse.status).toBe(200);
      expect(pdfResponse.headers['content-type']).toBe('application/pdf');

      console.log('✅ Étape 9: PDF exporté');

      // ========================================
      // WORKFLOW COMPLET RÉUSSI
      // ========================================
      console.log('\n🎉 WORKFLOW COMPLET RÉUSSI!\n');
    });
  });

  describe('Workflow: Notifications', () => {
    
    it('devrait créer des notifications lors de la publication', async () => {
      // Créer et publier une évaluation
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
        enonce: 'Test',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: quizz.id
      });

      await evaluation.addClasse(classe);

      // Publier
      await request(app)
        .post(`/api/evaluations/${evaluation.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Vérifier les notifications
      const notificationsResponse = await request(app)
        .get('/api/student/notifications')
        .set('Authorization', `Bearer ${etudiantToken}`);

      expect(notificationsResponse.status).toBe(200);
      expect(notificationsResponse.body.length).toBeGreaterThan(0);
      
      const notification = notificationsResponse.body[0];
      expect(notification.typeNotification).toBe('NOUVELLE_EVALUATION');
      expect(notification.NotificationEtudiant.estLue).toBe(false);

      console.log('✅ Notifications créées et récupérées');
    });
  });
});
