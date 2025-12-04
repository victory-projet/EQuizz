// backend/tests/integration/auth.test.js

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const { setupTestDatabase, cleanupTestDatabase, clearAllTables } = require('../helpers/db-setup');

describe('Auth Integration Tests', () => {
  
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await clearAllTables();
  });

  describe('POST /api/auth/login', () => {
    
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Arrange - Créer un utilisateur de test
      const ecole = await db.Ecole.create({
        nom: 'Test School'
      });

      const classe = await db.Classe.create({
        nom: 'Test Class',
        niveau: 'L3',
        ecole_id: ecole.id
      });

      const utilisateur = await db.Utilisateur.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test.user@saintjeaningenieur.org',
        motDePasseHash: 'password123' // Sera haché automatiquement
      });

      await db.Etudiant.create({
        id: utilisateur.id,
        matricule: '20230001',
        classe_id: classe.id
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.user@saintjeaningenieur.org',
          motDePasse: 'password123'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('utilisateur');
      expect(response.body.utilisateur.email).toBe('test.user@saintjeaningenieur.org');
    });

    it('devrait rejeter avec des identifiants invalides', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@test.com',
          motDePasse: 'wrongpassword'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('devrait valider les champs requis', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/link-card', () => {
    
    it('devrait lier une carte à un compte activé', async () => {
      // Arrange
      const ecole = await db.Ecole.create({
        nom: 'Test School'
      });

      const classe = await db.Classe.create({
        nom: 'Test Class',
        niveau: 'L3',
        ecole_id: ecole.id
      });

      const utilisateur = await db.Utilisateur.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test.user@saintjeaningenieur.org',
        motDePasseHash: 'password123'
      });

      const etudiant = await db.Etudiant.create({
        id: utilisateur.id,
        matricule: '20230001',
        classe_id: classe.id
      });

      // Act
      const response = await request(app)
        .post('/api/auth/link-card')
        .send({
          matricule: '20230001',
          idCarte: 'CARD123456'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Vérifier que la carte a été liée
      const etudiantUpdated = await db.Etudiant.findOne({
        where: { matricule: '20230001' }
      });
      expect(etudiantUpdated.idCarte).toBe('CARD123456');
    });
  });
});
