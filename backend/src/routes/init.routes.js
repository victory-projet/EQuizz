// src/routes/init.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');

// Route pour initialiser toutes les données
router.post('/seed', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Vérifier si des données existent déjà
    const userCount = await db.Utilisateur.count();
    if (userCount > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'La base de données contient déjà des données. Utilisez /reset pour réinitialiser.' 
      });
    }

    // 1. Créer l'école
    const ecole = await db.Ecole.create({
      nom: 'Saint Jean Ingenieur'
    }, { transaction });

    // 2. Créer l'année académique
    const anneeAcademique = await db.AnneeAcademique.create({
      libelle: '2024-2025',
      dateDebut: '2024-09-01',
      dateFin: '2025-06-30',
      estCourante: true
    }, { transaction });

    // 3. Créer les semestres
    const semestre1 = await db.Semestre.create({
      nom: 'Semestre 1',
      numero: 1,
      dateDebut: '2024-09-01',
      dateFin: '2025-01-31',
      annee_academique_id: anneeAcademique.id
    }, { transaction });

    const semestre2 = await db.Semestre.create({
      nom: 'Semestre 2',
      numero: 2,
      dateDebut: '2025-02-01',
      dateFin: '2025-06-30',
      annee_academique_id: anneeAcademique.id
    }, { transaction });

    // 4. Créer les classes
    const classes = await db.Classe.bulkCreate([
      { nom: 'ING4 ISI FR', niveau: 'ING4', ecole_id: ecole.id },
      { nom: 'ING4 ISI EN', niveau: 'ING4', ecole_id: ecole.id },
      { nom: 'ING5 ISI FR', niveau: 'ING5', ecole_id: ecole.id },
      { nom: 'ING3 GC FR', niveau: 'ING3', ecole_id: ecole.id }
    ], { transaction });

    // 5. Créer les utilisateurs (Administrateurs)
    const adminUser = await db.Utilisateur.create({
      nom: 'admin',
      prenom: 'super',
      email: 'super.admin@saintjeaningenieur.org',
      motDePasseHash: 'Admin123!'
    }, { transaction });

    await db.Administrateur.create({
      id: adminUser.id
    }, { transaction });

    // 6. Créer les enseignants
    const enseignantUser1 = await db.Utilisateur.create({
      nom: 'mepe',
      prenom: 'victoire',
      email: 'victoire.mepe@saintjeaningenieur.org',
      motDePasseHash: 'Prof123!'
    }, { transaction });

    const enseignant1 = await db.Enseignant.create({
      id: enseignantUser1.id,
      specialite: 'Informatique'
    }, { transaction });

    const enseignantUser2 = await db.Utilisateur.create({
      nom: 'kouang',
      prenom: 'priscille',
      email: 'priscille.kouang@saintjeaningenieur.org',
      motDePasseHash: 'Prof123!'
    }, { transaction });

    const enseignant2 = await db.Enseignant.create({
      id: enseignantUser2.id,
      specialite: 'Mathématiques'
    }, { transaction });

    // 7. Créer les cours
    const cours1 = await db.Cours.create({
      code: 'INF401',
      nom: 'Bases de Données Avancées',
      semestre_id: semestre1.id,
      enseignant_id: enseignant1.id
    }, { transaction });

    const cours2 = await db.Cours.create({
      code: 'INF402',
      nom: 'Développement Web',
      semestre_id: semestre1.id,
      enseignant_id: enseignant1.id
    }, { transaction });

    const cours3 = await db.Cours.create({
      code: 'MAT401',
      nom: 'Analyse Numérique',
      semestre_id: semestre1.id,
      enseignant_id: enseignant2.id
    }, { transaction });

    // 8. Associer les cours aux classes
    await cours1.addClasses([classes[0], classes[1]], { transaction });
    await cours2.addClasses([classes[0], classes[1]], { transaction });
    await cours3.addClasses([classes[0], classes[1], classes[2]], { transaction });

    // 9. Créer des étudiants
    const etudiantUser1 = await db.Utilisateur.create({
      nom: 'sims',
      prenom: 'gills',
      email: 'gills.sims@saintjeaningenieur.org',
      motDePasseHash: 'Etudiant123!'
    }, { transaction });

    await db.Etudiant.create({
      id: etudiantUser1.id,
      matricule: 'ING4-2024-001',
      classe_id: classes[0].id
    }, { transaction });

    const etudiantUser2 = await db.Utilisateur.create({
      nom: 'petit',
      prenom: 'lucas',
      email: 'lucas.petit@saintjeaningenieur.org',
      motDePasseHash: 'Etudiant123!'
    }, { transaction });

    await db.Etudiant.create({
      id: etudiantUser2.id,
      matricule: 'ING4-2024-002',
      classe_id: classes[0].id
    }, { transaction });

    const etudiantUser3 = await db.Utilisateur.create({
      nom: 'takam',
      prenom: 'emma',
      email: 'emma.takam@saintjeaningenieur.org',
      motDePasseHash: 'Etudiant123!'
    }, { transaction });

    await db.Etudiant.create({
      id: etudiantUser3.id,
      matricule: 'ING4-2024-003',
      classe_id: classes[1].id
    }, { transaction });

    // 10. Créer une évaluation
    const evaluation = await db.Evaluation.create({
      titre: 'Évaluation Mi-Parcours - Bases de Données',
      description: 'Évaluation de satisfaction du cours de Bases de Données Avancées',
      dateDebut: new Date('2024-11-01T08:00:00'),
      dateFin: new Date('2024-11-15T23:59:59'),
      datePublication: new Date('2024-11-01T08:00:00'),
      typeEvaluation: 'MI_PARCOURS',
      statut: 'PUBLIEE',
      administrateur_id: adminUser.id,
      cours_id: cours1.id
    }, { transaction });

    // Associer l'évaluation aux classes
    await evaluation.addClasses([classes[0], classes[1]], { transaction });

    // 11. Créer un quizz pour l'évaluation
    const quizz = await db.Quizz.create({
      titre: 'Questionnaire de satisfaction - Bases de Données',
      instructions: 'Veuillez répondre honnêtement à ces questions. Vos réponses sont anonymes et nous aideront à améliorer le cours.',
      evaluation_id: evaluation.id
    }, { transaction });

    // 12. Créer des questions
    await db.Question.bulkCreate([
      {
        enonce: 'Comment évaluez-vous la clarté des explications du professeur ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['Très claire', 'Claire', 'Moyenne', 'Peu claire', 'Pas claire du tout'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Le rythme du cours est-il adapté ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['Trop rapide', 'Rapide', 'Adapté', 'Lent', 'Trop lent'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Les supports de cours sont-ils utiles ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['Très utiles', 'Utiles', 'Moyennement utiles', 'Peu utiles', 'Pas utiles'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Quelles suggestions avez-vous pour améliorer ce cours ?',
        typeQuestion: 'REPONSE_OUVERTE',
        options: [],
        quizz_id: quizz.id
      },
      {
        enonce: 'Recommanderiez-vous ce cours à d\'autres étudiants ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['Certainement', 'Probablement', 'Peut-être', 'Probablement pas', 'Certainement pas'],
        quizz_id: quizz.id
      }
    ], { transaction });

    await transaction.commit();

    res.json({ 
      success: true,
      message: '✅ Base de données peuplée avec succès !',
      data: {
        ecole: ecole.nom,
        anneeAcademique: anneeAcademique.libelle,
        classes: classes.length,
        cours: 3,
        enseignants: 2,
        etudiants: 3,
        evaluations: 1,
        questions: 5
      },
      credentials: {
        admin: { 
          email: 'super.admin@saintjeaningenieur.org', 
          password: 'Admin123!' 
        },
        enseignant: { 
          email: 'marie.dupont@saintjeaningenieur.org', 
          password: 'Prof123!' 
        },
        etudiant: { 
          email: 'sophie.bernard@saintjeaningenieur.org', 
          password: 'Etudiant123!' 
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors du peuplement:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du peuplement de la base de données',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route pour réinitialiser complètement la base de données
router.post('/reset', async (req, res) => {
  try {
    await db.sequelize.sync({ force: true });
    res.json({ 
      success: true,
      message: '✅ Base de données réinitialisée. Utilisez /seed pour la peupler.' 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message 
    });
  }
});

module.exports = router;
