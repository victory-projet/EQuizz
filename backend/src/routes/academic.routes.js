const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const ecoleController = require('../controllers/ecole.controller'); // Nous allons créer ce fichier juste après
const anneeAcademiqueController = require('../controllers/anneeAcademique.controller');
const semestreController = require('../controllers/semestre.controller');
const coursController = require('../controllers/cours.controller');
const classeController = require('../controllers/classe.controller');


// Sécurisation Globale des Routes Académiques 
router.use(authenticate, isAdmin);

//  Routes pour la gestion des Écoles (CRUD) 

// POST /api/academic/ecoles - Créer une nouvelle école
router.post('/ecoles', ecoleController.create);

// GET /api/academic/ecoles - Obtenir la liste de toutes les écoles
router.get('/ecoles', ecoleController.findAll);

// GET /api/academic/ecoles/:id - Obtenir une école par son ID
router.get('/ecoles/:id', ecoleController.findOne);

// PUT /api/academic/ecoles/:id - Mettre à jour une école par son ID
router.put('/ecoles/:id', ecoleController.update);

// DELETE /api/academic/ecoles/:id - Supprimer une école par son ID
router.delete('/ecoles/:id', ecoleController.delete);


// --- Routes pour la gestion des Années Académiques (CRUD) ---
router.post('/annees-academiques', anneeAcademiqueController.create);
router.get('/annees-academiques', anneeAcademiqueController.findAll);
router.get('/annees-academiques/:id', anneeAcademiqueController.findOne);
router.put('/annees-academiques/:id', anneeAcademiqueController.update);
router.delete('/annees-academiques/:id', anneeAcademiqueController.delete);

// --- Routes pour la gestion des Semestres (CRUD) ---

// POST /api/academic/semestres - Créer un nouveau semestre
router.post('/semestres', semestreController.create);

// GET /api/academic/annees-academiques/:anneeId/semestres - Obtenir les semestres d'une année
router.get('/annees-academiques/:anneeId/semestres', semestreController.findAllByAnnee);

// GET /api/academic/semestres/:id - Obtenir un semestre par son ID
router.get('/semestres/:id', semestreController.findOne);

// PUT /api/academic/semestres/:id - Mettre à jour un semestre
router.put('/semestres/:id', semestreController.update);

// DELETE /api/academic/semestres/:id - Supprimer un semestre
router.delete('/semestres/:id', semestreController.delete);

// --- Routes pour la gestion des Cours (CRUD) ---

router.post('/cours', coursController.create);
router.get('/cours', coursController.findAll);
router.get('/cours/:id', coursController.findOne);
router.put('/cours/:id', coursController.update);
router.delete('/cours/:id', coursController.delete);

// --- Routes pour la gestion des Classes (CRUD) ---

router.post('/classes', classeController.create);
router.get('/classes', classeController.findAll);
router.get('/classes/:id', classeController.findOne);
router.put('/classes/:id', classeController.update);
router.delete('/classes/:id', classeController.delete);

// --- Routes pour la relation Classe <-> Cours ---
// POST /api/academic/classes/:classeId/cours/:coursId - Associer un cours à une classe
router.post('/classes/:classeId/cours/:coursId', classeController.addCoursToClasse);
// DELETE /api/academic/classes/:classeId/cours/:coursId - Dissocier un cours d'une classe
router.delete('/classes/:classeId/cours/:coursId', classeController.removeCoursFromClasse);


module.exports = router;