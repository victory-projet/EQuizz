// backend/src/services/export.service.js

const ExcelJS = require('exceljs');
const db = require('../models');

class ExportService {
  /**
   * Exporte les résultats d'une évaluation en Excel
   */
  async exportEvaluationToExcel(evaluationId, classeId = null) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours },
        { model: db.Classe },
        {
          model: db.Quizz,
          include: [
            {
              model: db.Question,
              include: [
                {
                  model: db.ReponseEtudiant,
                  include: [
                    {
                      model: db.Etudiant,
                      include: [
                        { model: db.Utilisateur },
                        { model: db.Classe }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const workbook = new ExcelJS.Workbook();
    
    // Feuille 1: Résumé
    const summarySheet = workbook.addWorksheet('Résumé');
    summarySheet.columns = [
      { header: 'Information', key: 'label', width: 30 },
      { header: 'Valeur', key: 'value', width: 50 }
    ];

    summarySheet.addRows([
      { label: 'Titre', value: evaluation.titre },
      { label: 'Cours', value: evaluation.Cours.nom },
      { label: 'Date début', value: evaluation.dateDebut },
      { label: 'Date fin', value: evaluation.dateFin },
      { label: 'Statut', value: evaluation.statut },
      { label: 'Nombre de questions', value: evaluation.Quizz.Questions.length }
    ]);

    // Feuille 2: Réponses par étudiant
    const responsesSheet = workbook.addWorksheet('Réponses');
    
    // En-têtes dynamiques
    const headers = [
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Classe', key: 'classe', width: 15 }
    ];

    // Ajouter une colonne par question
    evaluation.Quizz.Questions.forEach((q, index) => {
      headers.push({
        header: `Q${index + 1}`,
        key: `q${index + 1}`,
        width: 30
      });
    });

    responsesSheet.columns = headers;

    // Récupérer toutes les sessions de réponse
    const sessions = await db.SessionReponse.findAll({
      where: { quizz_id: evaluation.Quizz.id },
      include: [
        {
          model: db.Etudiant,
          where: classeId ? { classe_id: classeId } : {},
          include: [
            { model: db.Utilisateur },
            { model: db.Classe }
          ]
        },
        {
          model: db.ReponseEtudiant,
          include: [{ model: db.Question }]
        }
      ]
    });

    // Remplir les données
    sessions.forEach(session => {
      const row = {
        matricule: session.Etudiant.matricule,
        nom: session.Etudiant.Utilisateur.nom,
        prenom: session.Etudiant.Utilisateur.prenom,
        classe: session.Etudiant.Classe?.nom || 'N/A'
      };

      // Ajouter les réponses
      evaluation.Quizz.Questions.forEach((question, index) => {
        const reponse = session.ReponseEtudiants.find(
          r => r.question_id === question.id
        );
        row[`q${index + 1}`] = reponse ? reponse.contenu : 'Pas de réponse';
      });

      responsesSheet.addRow(row);
    });

    // Feuille 3: Questions
    const questionsSheet = workbook.addWorksheet('Questions');
    questionsSheet.columns = [
      { header: 'N°', key: 'numero', width: 5 },
      { header: 'Question', key: 'enonce', width: 50 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Options', key: 'options', width: 50 }
    ];

    evaluation.Quizz.Questions.forEach((q, index) => {
      questionsSheet.addRow({
        numero: index + 1,
        enonce: q.enonce,
        type: q.typeQuestion,
        options: q.typeQuestion === 'CHOIX_MULTIPLE' 
          ? q.options.join('; ') 
          : 'N/A'
      });
    });

    // Feuille 4: Statistiques par question
    const statsSheet = workbook.addWorksheet('Statistiques');
    statsSheet.columns = [
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Réponses', key: 'reponses', width: 15 }
    ];

    for (const question of evaluation.Quizz.Questions) {
      let reponses = question.ReponseEtudiants;
      
      if (classeId) {
        reponses = reponses.filter(r => 
          r.Etudiant && r.Etudiant.Classe && r.Etudiant.Classe.id === classeId
        );
      }

      const row = {
        question: question.enonce,
        type: question.typeQuestion,
        reponses: reponses.length
      };

      statsSheet.addRow(row);

      // Si choix multiple, ajouter la distribution
      if (question.typeQuestion === 'CHOIX_MULTIPLE') {
        const distribution = {};
        question.options.forEach(opt => { distribution[opt] = 0; });
        
        reponses.forEach(r => {
          if (r.contenu && distribution.hasOwnProperty(r.contenu)) {
            distribution[r.contenu]++;
          }
        });

        Object.entries(distribution).forEach(([option, count]) => {
          const pct = reponses.length > 0 
            ? ((count / reponses.length) * 100).toFixed(2) 
            : 0;
          statsSheet.addRow({
            question: `  → ${option}`,
            type: '',
            reponses: `${count} (${pct}%)`
          });
        });
      }
    }

    // Générer le buffer
    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exporte la liste des étudiants en Excel
   */
  async exportStudentsToExcel(classeId = null) {
    const whereClause = classeId ? { classe_id: classeId } : {};
    
    const etudiants = await db.Etudiant.findAll({
      where: whereClause,
      include: [
        { model: db.Utilisateur },
        { model: db.Classe }
      ],
      order: [[db.Utilisateur, 'nom', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Étudiants');

    sheet.columns = [
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Classe', key: 'classe', width: 15 },
      { header: 'Actif', key: 'actif', width: 10 }
    ];

    etudiants.forEach(etudiant => {
      sheet.addRow({
        matricule: etudiant.matricule,
        nom: etudiant.Utilisateur.nom,
        prenom: etudiant.Utilisateur.prenom,
        email: etudiant.Utilisateur.email,
        classe: etudiant.Classe?.nom || 'Non assigné',
        actif: etudiant.Utilisateur.estActif ? 'Oui' : 'Non'
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exporte la liste des cours en Excel
   */
  async exportCoursesToExcel() {
    const cours = await db.Cours.findAll({
      include: [
        {
          model: db.Enseignant,
          include: [{ model: db.Utilisateur }]
        },
        { model: db.Semestre },
        { model: db.AnneeAcademique }
      ],
      order: [['code', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cours');

    sheet.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Nom', key: 'nom', width: 30 },
      { header: 'Enseignant', key: 'enseignant', width: 25 },
      { header: 'Semestre', key: 'semestre', width: 15 },
      { header: 'Année', key: 'annee', width: 15 }
    ];

    cours.forEach(c => {
      sheet.addRow({
        code: c.code,
        nom: c.nom,
        enseignant: c.Enseignant 
          ? `${c.Enseignant.Utilisateur.prenom} ${c.Enseignant.Utilisateur.nom}`
          : 'Non assigné',
        semestre: c.Semestre?.nom || 'N/A',
        annee: c.AnneeAcademique?.nom || 'N/A'
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Exporte les statistiques globales en Excel
   */
  async exportGlobalStatsToExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // Statistiques générales
    const statsSheet = workbook.addWorksheet('Statistiques');
    statsSheet.columns = [
      { header: 'Indicateur', key: 'label', width: 30 },
      { header: 'Valeur', key: 'value', width: 15 }
    ];

    const [
      totalEtudiants,
      totalEnseignants,
      totalCours,
      totalEvaluations,
      evaluationsActives
    ] = await Promise.all([
      db.Etudiant.count(),
      db.Enseignant.count(),
      db.Cours.count(),
      db.Evaluation.count(),
      db.Evaluation.count({ where: { statut: 'PUBLIEE' } })
    ]);

    statsSheet.addRows([
      { label: 'Total étudiants', value: totalEtudiants },
      { label: 'Total enseignants', value: totalEnseignants },
      { label: 'Total cours', value: totalCours },
      { label: 'Total évaluations', value: totalEvaluations },
      { label: 'Évaluations actives', value: evaluationsActives }
    ]);

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new ExportService();
