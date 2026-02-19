// backend/tests/integration/etudiant.transfer.test.js

const request = require('supertest');
const app = require('../../app');
const db = require('../../src/models');
const jwtService = require('../../src/services/jwt.service');

describe('Tests d\'Intégration - Transfert d\'Étudiants', () => {
  let adminToken;
  let ecole1, ecole2;
  let anneeAcademique;
  let classe1, _classe2, classe3;
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
    const adminWithRole = await db.Utilisateur.findByPk(adminUser.id, {
      include: [{ model: db.Administrateur }]
    });
    adminToken = jwtService.generateToken(adminWithRole);

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
      libelle: '2023-2024',
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

    _classe2 = await db.Classe.create({
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
        email: { [db.Sequelize.Op.like]: '%etudiant%' },
        id: { [db.Sequelize.Op.ne]: 'admin-id-placeholder' } // Correct way is to filter by role if needed
      },
      force: true
    });
    // To be safer, just delete students
  });

  describe('POST /api/academic/etudiants - Création d\'un étudiant', () => {
    test('devrait créer un étudiant avec un matricule manuel et matriculeUniv auto-généré', async () => {
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@saintjeaningenieur.org',
          matricule: 'SJI-2024-001',
          classe_id: classe1.id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('matricule', 'SJI-2024-001');
      expect(response.body).toHaveProperty('matriculeUniv');
      expect(response.body.matriculeUniv).toMatch(/^UNIV-\d{4}-\d{5}$/);

      // Vérifier que l'historique a été créé
      const historique = await db.HistoriqueEtudiant.findAll({
        where: { etudiant_id: response.body.id }
      });

      expect(historique).toHaveLength(1);
      expect(historique[0].matricule).toBe('SJI-2024-001');
      expect(historique[0].estPeriodeActuelle).toBe(true);
    });

    test('devrait rejeter la création sans matricule', async () => {
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Martin',
          prenom: 'Sophie',
          email: 'sophie.martin@saintjeaningenieur.org',
          classe_id: classe1.id
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MATRICULE_REQUIRED');
    });
  });

  describe('PUT /api/academic/etudiants/:id/transfert - Transfert d\'école', () => {
    beforeEach(async () => {
      // Créer un étudiant pour les tests
      const response = await request(app)
        .post('/api/academic/etudiants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nom: 'Transfer',
          prenom: 'Test',
          email: 'transfer.test@saintjeaningenieur.org',
          matricule: 'SJI-2024-001',
          classe_id: classe1.id
        });

      etudiant = response.body;
    });

    test('devrait accepter un nouveau matricule lors d\'un transfert', async () => {
      const matriculeInitial = etudiant.matricule;
      const matriculeUnivInitial = etudiant.matriculeUniv;
      const uuidInitial = etudiant.id;

      const response = await request(app)
        .post(`/api/academic/etudiants/${etudiant.id}/transfert`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nouvelleClasseId: classe3.id,
          nouveauMatricule: 'POL-2024-999'
        });

      expect(response.status).toBe(200);
      expect(response.body.etudiant.id).toBe(uuidInitial);
      expect(response.body.etudiant.matricule).toBe('POL-2024-999');
      expect(response.body.etudiant.matriculeUniv).toBe(matriculeUnivInitial); // Permanent

      // Vérifier l'historique
      const historique = await db.HistoriqueEtudiant.findAll({
        where: { etudiant_id: etudiant.id },
        order: [['dateDebut', 'DESC']]
      });

      expect(historique).toHaveLength(2);
      expect(historique[0].matricule).toBe('POL-2024-999');
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
          matricule: 'SJI-H-001',
          classe_id: classe1.id
        });

      etudiant = response.body;

      // Faire un transfert
      await request(app)
        .post(`/api/academic/etudiants/${etudiant.id}/transfert`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nouvelleClasseId: classe3.id,
          nouveauMatricule: 'POL-H-001'
        });
    });

    test('devrait retourner l\'historique complet d\'un étudiant', async () => {
      const response = await request(app)
        .get(`/api/academic/etudiants/${etudiant.id}/historique`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].matricule).toBe('POL-H-001');
      expect(response.body[1].matricule).toBe('SJI-H-001');
    });
  });
});
