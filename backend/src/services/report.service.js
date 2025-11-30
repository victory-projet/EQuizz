// backend/src/services/report.service.js

const db = require('../models');
// Utiliser Gemini si disponible, sinon fallback sur sentiment basique
const sentimentService = process.env.GOOGLE_AI_API_KEY 
  ? require('./sentiment-gemini.service')
  : require('./sentiment.service');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');

class ReportService {
  /**
   * Génère un rapport complet pour une évaluation
   * @param {string} evaluationId - L'ID de l'évaluation
   * @param {string} classeId - Filtre optionnel par classe
   */
  async generateReport(evaluationId, classeId = null) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours, required: false },
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
                      model: db.SessionReponse,
                      include: [
                        { 
                          model: db.Etudiant, 
                          include: [{ model: db.Classe }] 
                        }
                      ]
                    },
                    { model: db.AnalyseReponse }
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

    // Filtrer par classe si nécessaire
    let reponses = [];
    evaluation.Quizz.Questions.forEach(question => {
      question.ReponseEtudiants.forEach(reponse => {
        // L'étudiant est accessible via SessionReponse
        const etudiant = reponse.SessionReponse?.Etudiant;
        if (etudiant && (!classeId || etudiant.Classe?.id === classeId)) {
          reponses.push(reponse);
        }
      });
    });

    // Calculer les statistiques
    const stats = await this.calculateStatistics(evaluation, classeId);
    
    // Analyser les sentiments si pas déjà fait
    await sentimentService.analyzeEvaluationReponses(evaluationId);

    // Récupérer les analyses de sentiment
    const sentimentAnalysis = await this.getSentimentAnalysis(evaluationId, classeId);

    return {
      evaluation: {
        id: evaluation.id,
        titre: evaluation.titre,
        cours: evaluation.Cours.nom,
        dateDebut: evaluation.dateDebut,
        dateFin: evaluation.dateFin,
        statut: evaluation.statut
      },
      statistics: stats,
      sentimentAnalysis,
      questions: await this.getQuestionDetails(evaluation, classeId)
    };
  }

  /**
   * Calcule les statistiques de participation
   */
  async calculateStatistics(evaluation, classeId = null) {
    // Nombre total d'étudiants ciblés
    let totalEtudiants = 0;
    if (classeId) {
      const classe = await db.Classe.findByPk(classeId, {
        include: [{ model: db.Etudiant }]
      });
      totalEtudiants = classe ? classe.Etudiants.length : 0;
    } else {
      for (const classe of evaluation.Classes) {
        const classeWithEtudiants = await db.Classe.findByPk(classe.id, {
          include: [{ model: db.Etudiant }]
        });
        totalEtudiants += classeWithEtudiants.Etudiants.length;
      }
    }

    // Nombre d'étudiants ayant répondu
    const whereClause = classeId ? { '$Etudiant.classe_id$': classeId } : {};
    
    const reponsesUniques = await db.SessionReponse.findAll({
      where: { quizz_id: evaluation.Quizz.id },
      include: [
        {
          model: db.Etudiant,
          where: classeId ? { classe_id: classeId } : {},
          required: true
        }
      ],
      group: ['etudiant_id']
    });

    const nombreRepondants = reponsesUniques.length;
    const tauxParticipation = totalEtudiants > 0 
      ? ((nombreRepondants / totalEtudiants) * 100).toFixed(2)
      : 0;

    return {
      totalEtudiants,
      nombreRepondants,
      tauxParticipation: parseFloat(tauxParticipation)
    };
  }

  /**
   * Analyse les sentiments des réponses ouvertes
   */
  async getSentimentAnalysis(evaluationId, classeId = null) {
    const whereClause = {
      '$Question.Quizz.Evaluation.id$': evaluationId,
      '$Question.typeQuestion$': 'REPONSE_OUVERTE'
    };

    if (classeId) {
      whereClause['$Etudiant.classe_id$'] = classeId;
    }

    const reponses = await db.ReponseEtudiant.findAll({
      where: whereClause,
      include: [
        {
          model: db.Question,
          include: [
            {
              model: db.Quizz,
              include: [{ model: db.Evaluation }]
            }
          ]
        },
        { 
          model: db.SessionReponse,
          include: [{ model: db.Etudiant }]
        },
        { model: db.AnalyseReponse }
      ]
    });

    // Compter les sentiments
    const sentimentCounts = {
      POSITIF: 0,
      NEUTRE: 0,
      NEGATIF: 0
    };

    const textes = [];
    reponses.forEach(reponse => {
      if (reponse.AnalyseReponse) {
        sentimentCounts[reponse.AnalyseReponse.sentiment]++;
      }
      if (reponse.contenu) {
        textes.push(reponse.contenu);
      }
    });

    // Extraire les mots-clés
    const keywords = await sentimentService.extractKeywords(textes, 20);

    // Générer un résumé avec Gemini (si disponible)
    let summary = null;
    if (sentimentService.generateSummary && textes.length > 0) {
      try {
        summary = await sentimentService.generateSummary(textes);
      } catch (error) {
        console.error('Erreur génération résumé:', error);
      }
    }

    const total = reponses.length;
    return {
      total,
      sentiments: {
        positif: sentimentCounts.POSITIF,
        neutre: sentimentCounts.NEUTRE,
        negatif: sentimentCounts.NEGATIF,
        positifPct: total > 0 ? ((sentimentCounts.POSITIF / total) * 100).toFixed(2) : 0,
        neutrePct: total > 0 ? ((sentimentCounts.NEUTRE / total) * 100).toFixed(2) : 0,
        negatifPct: total > 0 ? ((sentimentCounts.NEGATIF / total) * 100).toFixed(2) : 0
      },
      keywords,
      summary,
      reponses: reponses.map(r => ({
        texte: r.contenu,
        sentiment: r.AnalyseReponse?.sentiment,
        score: r.AnalyseReponse?.score
      }))
    };
  }

  /**
   * Récupère les détails des questions avec répartition des réponses
   */
  async getQuestionDetails(evaluation, classeId = null) {
    const questions = [];

    for (const question of evaluation.Quizz.Questions) {
      let reponses = question.ReponseEtudiants;
      
      if (classeId) {
        reponses = reponses.filter(r => r.Etudiant.Classe.id === classeId);
      }

      const questionData = {
        id: question.id,
        enonce: question.enonce,
        typeQuestion: question.typeQuestion,
        totalReponses: reponses.length
      };

      if (question.typeQuestion === 'CHOIX_MULTIPLE') {
        // Calculer la répartition des réponses
        const distribution = {};
        question.options.forEach(option => {
          distribution[option] = 0;
        });

        reponses.forEach(reponse => {
          if (reponse.contenu && Object.prototype.hasOwnProperty.call(distribution, reponse.contenu)) {
            distribution[reponse.contenu]++;
          }
        });

        questionData.options = question.options;
        questionData.distribution = distribution;
        questionData.distributionPct = {};
        
        Object.keys(distribution).forEach(option => {
          questionData.distributionPct[option] = reponses.length > 0
            ? ((distribution[option] / reponses.length) * 100).toFixed(2)
            : 0;
        });
      }

      questions.push(questionData);
    }

    return questions;
  }

  /**
   * Génère un PDF du rapport
   */
  async generatePDF(evaluationId, classeId = null) {
    const report = await this.generateReport(evaluationId, classeId);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(20).text('Rapport d\'Évaluation', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`${report.evaluation.titre}`, { align: 'center' });
      doc.fontSize(12).text(`Cours: ${report.evaluation.cours}`, { align: 'center' });
      doc.moveDown();

      // Statistiques de participation
      doc.fontSize(16).text('Statistiques de Participation');
      doc.fontSize(12);
      doc.text(`Total étudiants: ${report.statistics.totalEtudiants}`);
      doc.text(`Nombre de répondants: ${report.statistics.nombreRepondants}`);
      doc.text(`Taux de participation: ${report.statistics.tauxParticipation}%`);
      doc.moveDown();

      // Analyse des sentiments
      if (report.sentimentAnalysis.total > 0) {
        doc.fontSize(16).text('Analyse des Sentiments');
        doc.fontSize(12);
        doc.text(`Total de réponses ouvertes: ${report.sentimentAnalysis.total}`);
        doc.text(`Positif: ${report.sentimentAnalysis.sentiments.positif} (${report.sentimentAnalysis.sentiments.positifPct}%)`);
        doc.text(`Neutre: ${report.sentimentAnalysis.sentiments.neutre} (${report.sentimentAnalysis.sentiments.neutrePct}%)`);
        doc.text(`Négatif: ${report.sentimentAnalysis.sentiments.negatif} (${report.sentimentAnalysis.sentiments.negatifPct}%)`);
        doc.moveDown();

        // Résumé IA (si disponible)
        if (report.sentimentAnalysis.summary) {
          doc.fontSize(14).text('Résumé des commentaires:');
          doc.fontSize(10);
          doc.text(report.sentimentAnalysis.summary, { align: 'justify' });
          doc.moveDown();
        }

        // Mots-clés
        if (report.sentimentAnalysis.keywords.length > 0) {
          doc.fontSize(14).text('Mots-clés principaux:');
          doc.fontSize(10);
          report.sentimentAnalysis.keywords.slice(0, 10).forEach(kw => {
            doc.text(`- ${kw.word} (${kw.count})`);
          });
          doc.moveDown();
        }
      }

      // Questions
      doc.addPage();
      doc.fontSize(16).text('Détail des Questions');
      doc.moveDown();

      report.questions.forEach((q, index) => {
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }

        doc.fontSize(12).text(`Q${index + 1}: ${q.enonce}`);
        doc.fontSize(10).text(`Type: ${q.typeQuestion}`);
        doc.text(`Nombre de réponses: ${q.totalReponses}`);

        if (q.typeQuestion === 'CHOIX_MULTIPLE' && q.distribution) {
          doc.text('Répartition:');
          Object.entries(q.distribution).forEach(([option, count]) => {
            const pct = q.distributionPct[option];
            doc.text(`  ${option}: ${count} (${pct}%)`);
          });
        }

        doc.moveDown();
      });

      doc.end();
    });
  }
}

module.exports = new ReportService();
