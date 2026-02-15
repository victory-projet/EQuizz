// backend/tests/integration/etudiant.transfer.test.js

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const jwtService = require('../../src/services/jwt.service');

describe('Tests d\'Intégration - Transfert d\'Étudiants', () => {
  let adminToken;
  let ecole1, ecole2;
  let anneeAcademique;
  let classe1, classe2, classe3;
  let etudiant;

  beforeAll(async () => {
    // Synchroniser la base de données de test
    await db.sequelize.sync({ force: true });

    // Créer un administrateur pour les tests
    const adminUser = await db.Utilisateur.create({
      nom: 'Admin',
      prenom: 'Test',
      email: 'admin.test@saintjeaningenieur.org',
      motDePasseHash: 'hashedpassword',
      estActif: true
    });

    await db.Administrateur.create({
      id: adminUser.id,
      role: 'SUPER_ADMIN'
    });

    // Générer un token JWT pour l'admin
    adminToken = jwtService.generateToken(adminUser);

    // Créer deux écoles
    ecole1 = await db.Ecole.create({
      nom: 'Saint Jean Ingénieur',
      adresse: '123 Rue Test',
      telephone: '0123456789',
      email: 'contact@sjing.org'
    });

    ecole2 = await db.Ecole.create({
      nom: 'Polytechnique',
      adresse: '456 Avenue Tech',
      telephone: '0987654321',
      email: 'contact@polytech.org'
    });

    // Créer une année académique
    anneeAcademique = await db.AnneeAcademique.create({
      nom: '2023-2024',
      dateDebut: new Date('2023-09-01'),
      dateFin: new Date('2024-08-31')
    });

    // Créer des classes dans les deux écoles
    classe1 = await db.Classe.create({
      nom: 'ING4-A',
      niveau: '4',
      ecole_id: ecole1.id,
      anneeAcademiqueId: anneeAcademique.id
    });

    classe2 = await db.Classe.create({
      nom: 'ING4-B',
      niveau: '4',
      ecole_id: ecole1.id,
      anneeAcademiqueId: anneeAcademique.id
    });

    classe3 = await db.Classe.create({
      nom: 'ING5-A',
      niveau: '5',
      ecole_id: ecole2.id,
      anneeAcademiqueId: anneeAcademique.id
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    // Nettoyer les étudiants avant chaque test
    await db.HistoriqueEtudiant.destroy({ where: {}, force: true });
    await db.Etudiant.destroy({ where: {}, force: true });
    await db.Utilisateur.destroy({ 
      where: { 
        email: { [db.Sequelize.Op.like]: '%etudiant%' }
      }, 
      force: true 
    });
  });

  describe('POST /api/academic/etudiants - Création d\'un étudiant', () => {
    test('devrait créer un étudiant avec un matricule auto-généré', async () => {
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('matricule');
      expect(response.body.matricule).toMatch(/^SJING-2024-\d{3}$/);

      // Vérifier que l'historique a été créé
      const historique = await db.HistoriqueEtudiant.findAll({
        where: { etudiant_id: response.body.id }
      });

      expect(historique).toHaveLength(1);
      expect(historique[0].matricule).toBe(response.body.matricule);
      expect(historique[0].estPeriodeActuelle).toBe(true);
      expect(historique[0].dateFin).toBeNull();
    });

    test('devrait générer des matricules séquentiels', async () => {
      // Créer le premier étudiant
      const response1 = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      expect(response1.body.matricule).toBe('SJING-2024-001');

      // Créer le deuxième étudiant
      const response2 = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Bernard',
          prenom: 'Pierre',
          email: 'pierre.bernard@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      expect(response2.body.matricule).toBe('SJING-2024-002');
    });
  });

  describe('PUT /api/academic/etudiants/:id - Changement de classe (même école)', () => {
    beforeEach(async () => {
      // Créer un étudiant pour les tests
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Test',
          prenom: 'Etudiant',
          email: 'test.etudiant@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      etudiant = response.body;
    });

    test('devrait changer de classe sans changer le matricule', async () => {
      const matriculeInitial = etudiant.matricule;

      const response = await request(app)
        .put(`/api/academic/etudiants/${etudiant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe2.id
        });

      expect(response.status).toBe(200);
      expect(response.body.matricule).toBe(matriculeInitial);
      expect(response.body.classe_id).toBe(classe2.id);

      // Vérifier que l'historique n'a pas été dupliqué
      const historique = await db.HistoriqueEtudiant.findAll({
        where: { etudiant_id: etudiant.id }
      });

      expect(historique).toHaveLength(1);
      expect(historique[0].classe_id).toBe(classe2.id);
      expect(historique[0].estPeriodeActuelle).toBe(true);
    });
  });

  describe('PUT /api/academic/etudiants/:id - Transfert d\'école', () => {
    beforeEach(async () => {
      // Créer un étudiant pour les tests
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Transfer',
          prenom: 'Test',
          email: 'transfer.test@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      etudiant = response.body;
    });

    test('devrait générer un nouveau matricule lors d\'un transfert d\'école', async () => {
      const matriculeInitial = etudiant.matricule;
      const uuidInitial = etudiant.id;

      const response = await request(app)
        .put(`/api/academic/etudiants/${etudiant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe3.id
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(uuidInitial); // UUID reste le même
      expect(response.body.matricule).not.toBe(matriculeInitial); // Matricule change
      expect(response.body.matricule).toMatch(/^POLYT-2024-\d{3}$/);
      expect(response.body.classe_id).toBe(classe3.id);
    });

    test('devrait créer un historique complet lors d\'un transfert', async () => {
      const matriculeInitial = etudiant.matricule;

      await request(app)
        .put(`/api/academic/etudiants/${etudiant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe3.id
        });

      // Vérifier l'historique
      const historique = await db.HistoriqueEtudiant.findAll({
        where: { etudiant_id: etudiant.id },
        order: [['dateDebut', 'DESC']]
      });

      expect(historique).toHaveLength(2);

      // Vérifier la période actuelle (Polytechnique)
      expect(historique[0].estPeriodeActuelle).toBe(true);
      expect(historique[0].dateFin).toBeNull();
      expect(historique[0].ecole_id).toBe(ecole2.id);
      expect(historique[0].classe_id).toBe(classe3.id);
      expect(historique[0].matricule).toMatch(/^POLYT-2024-\d{3}$/);

      // Vérifier la période passée (Saint Jean)
      expect(historique[1].estPeriodeActuelle).toBe(false);
      expect(historique[1].dateFin).not.toBeNull();
      expect(historique[1].ecole_id).toBe(ecole1.id);
      expect(historique[1].classe_id).toBe(classe1.id);
      expect(historique[1].matricule).toBe(matriculeInitial);
    });
  });

  describe('GET /api/academic/etudiants/:id/historique - Récupérer l\'historique', () => {
    beforeEach(async () => {
      // Créer un étudiant
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Historique',
          prenom: 'Test',
          email: 'historique.test@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      etudiant = response.body;

      // Faire un transfert
      await request(app)
        .put(`/api/academic/etudiants/${etudiant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe3.id
        });
    });

    test('devrait retourner l\'historique complet d\'un étudiant', async () => {
      const response = await request(app)
        .get(`/api/academic/etudiants/${etudiant.id}/historique`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      // Vérifier que l'historique est trié par date décroissante
      expect(response.body[0].estPeriodeActuelle).toBe(true);
      expect(response.body[1].estPeriodeActuelle).toBe(false);

      // Vérifier que les relations sont incluses
      expect(response.body[0]).toHaveProperty('Ecole');
      expect(response.body[0]).toHaveProperty('Classe');
      expect(response.body[0].Ecole.nom).toBe('Polytechnique');
      expect(response.body[1].Ecole.nom).toBe('Saint Jean Ingénieur');
    });
  });

  describe('Scénario complet - Parcours d\'un étudiant', () => {
    test('devrait gérer un parcours complet avec plusieurs transferts', async () => {
      // 1. Créer l'étudiant dans l'école 1
      const createResponse = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Parcours',
          prenom: 'Complet',
          email: 'parcours.complet@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      const etudiantId = createResponse.body.id;
      const matricule1 = createResponse.body.matricule;

      expect(matricule1).toMatch(/^SJING-2024-\d{3}$/);

      // 2. Changer de classe dans la même école
      await request(app)
        .put(`/api/academic/etudiants/${etudiantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe2.id
        });

      // Vérifier que le matricule n'a pas changé
      const afterClassChange = await request(app)
        .get(`/api/academic/etudiants/${etudiantId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(afterClassChange.body.matricule).toBe(matricule1);

      // 3. Transférer vers l'école 2
      const transferResponse = await request(app)
        .put(`/api/academic/etudiants/${etudiantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classe_id: classe3.id
        });

      const matricule2 = transferResponse.body.matricule;
      expect(matricule2).toMatch(/^POLYT-2024-\d{3}$/);
      expect(matricule2).not.toBe(matricule1);

      // 4. Vérifier l'historique complet
      const historiqueResponse = await request(app)
        .get(`/api/academic/etudiants/${etudiantId}/historique`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(historiqueResponse.body).toHaveLength(2);
      
      // Période actuelle
      expect(historiqueResponse.body[0].matricule).toBe(matricule2);
      expect(historiqueResponse.body[0].Ecole.nom).toBe('Polytechnique');
      expect(historiqueResponse.body[0].estPeriodeActuelle).toBe(true);

      // Période passée
      expect(historiqueResponse.body[1].matricule).toBe(matricule1);
      expect(historiqueResponse.body[1].Ecole.nom).toBe('Saint Jean Ingénieur');
      expect(historiqueResponse.body[1].estPeriodeActuelle).toBe(false);
      expect(historiqueResponse.body[1].dateFin).not.toBeNull();
    });
  });
});
