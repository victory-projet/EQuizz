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
                      attributes: ['id', 'dateDebut', 'dateFin', 'statut'],  // Seulement les infos de session
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
        cours: evaluation.Cour?.nom || evaluation.Cours?.nom || 'Non défini',
        dateDebut: evaluation.dateDebut,
        dateFin: evaluation.dateFin,
        statut: evaluation.statut,
        classes: evaluation.Classes?.map(c => ({
          id: c.id,
          nom: c.nom
        })) || []
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

    // Nombre d'étudiants ayant répondu (anonymat complet - on compte les sessions uniques)
    const whereClause = { quizz_id: evaluation.Quizz.id };

    if (classeId) {
      whereClause['$Etudiant.classe_id$'] = classeId;
    }

    // Utiliser COUNT DISTINCT pour éviter les problèmes de GROUP BY
    const nombreRepondants = await db.SessionReponse.count({
      where: whereClause,
      include: classeId ? [
        {
          model: db.Etudiant,
          attributes: [],  // Pas d'attributs pour respecter l'anonymat
          where: { classe_id: classeId },
          required: true
        }
      ] : [],
      distinct: true,
      col: 'id'
    });

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
    // Récupérer l'évaluation avec les questions de type REPONSE_OUVERTE
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        {
          model: db.Quizz,
          include: [
            {
              model: db.Question,
              where: { typeQuestion: 'REPONSE_OUVERTE' },
              required: false,
              include: [
                {
                  model: db.ReponseEtudiant,
                  attributes: ['id', 'contenu'],
                  include: [
                    {
                      model: db.SessionReponse,
                      attributes: ['id']
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

    if (!evaluation || !evaluation.Quizz) {
      return {
        total: 0,
        sentiments: {
          positif: 0,
          neutre: 0,
          negatif: 0,
          positifPct: '0',
          neutrePct: '0',
          negatifPct: '0'
        },
        keywords: [],
        summary: null
      };
    }

    // Collecter toutes les réponses ouvertes
    const reponses = [];
    if (evaluation.Quizz.Questions) {
      evaluation.Quizz.Questions.forEach(question => {
        if (question.ReponseEtudiants) {
          question.ReponseEtudiants.forEach(reponse => {
            reponses.push(reponse);
          });
        }
      });
    }

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
        positifPct: total > 0 ? ((sentimentCounts.POSITIF / total) * 100).toFixed(2) : '0',
        neutrePct: total > 0 ? ((sentimentCounts.NEUTRE / total) * 100).toFixed(2) : '0',
        negatifPct: total > 0 ? ((sentimentCounts.NEGATIF / total) * 100).toFixed(2) : '0'
      },
      keywords,
      summary
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
    ```
    return questions;
  }

  /**
   * Génère un PDF du rapport avec un design professionnel et épuré
   */
  async generatePDF(evaluationId, classeId = null) {
    const report = await this.generateReport(evaluationId, classeId);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Palette de couleurs "Corporate"
      const colors = {
        primary: '#2C3E50',    // Bleu nuit (Titres, En-têtes)
        accent: '#3498DB',     // Bleu clair (Accents, Liens)
        text: '#333333',       // Gris foncé (Texte principal)
        secondaryText: '#7F8C8D', // Gris moyen (Sous-titres)
        lightBg: '#F8F9FA',    // Gris très clair (Fonds alternés)
        border: '#E5E7EB',     // Bordures subtiles
        success: '#27AE60',
        warning: '#F39C12',
        danger: '#C0392B'
      };

      // --- En-tête ---
      // Logo (simulé par un carré coloré si pas d'image) ou Nom de l'app
      doc.rect(50, 40, 40, 40).fill(colors.primary);
      doc.fontSize(20).fillColor('white').text('EQ', 57, 50); // EQuizz Initials
      
      doc.fillColor(colors.primary);
      doc.fontSize(24).font('Helvetica-Bold').text('RAPPORT D\'ÉVALUATION', 110, 45);
      doc.fontSize(10).font('Helvetica').fillColor(colors.secondaryText).text(`Généré le ${ new Date().toLocaleDateString('fr-FR') } `, 110, 75);

      // Ligne de séparation
      doc.moveTo(50, 95).lineTo(545, 95).strokeColor(colors.border).stroke();

      doc.moveDown(3);

      // --- Informations Générales (Grille) ---
      const infoY = 110;
      this.drawInfoBlock(doc, 'ÉVALUATION', report.evaluation.titre, 50, infoY, 240, colors);
      this.drawInfoBlock(doc, 'COURS', report.evaluation.cours, 300, infoY, 240, colors);
      
      doc.moveDown(4);

      // --- Statistiques Clés (Style KPI) ---
      this.drawSectionTitle(doc, 'PERFORMANCES', colors);
      
      const statsY = doc.y + 15;
      this.drawKpiBox(doc, 'Participation', `${ report.statistics.tauxParticipation }% `, 50, statsY, colors.accent);
      this.drawKpiBox(doc, 'Répondants', report.statistics.nombreRepondants.toString(), 215, statsY, colors.primary);
      this.drawKpiBox(doc, 'Cible', report.statistics.totalEtudiants.toString(), 380, statsY, colors.secondaryText);

      doc.moveDown(6);

      // --- Analyse des Sentiments ---
      if (report.sentimentAnalysis.total > 0) {
        this.drawSectionTitle(doc, 'ANALYSE DES SENTIMENTS', colors);
        const sentY = doc.y + 15;

        // Barres de sentiments horizontales
        this.drawSentimentBar(doc, 'Positif', report.sentimentAnalysis.sentiments.positifPct, colors.success, 50, sentY);
        this.drawSentimentBar(doc, 'Neutre', report.sentimentAnalysis.sentiments.neutrePct, colors.warning, 215, sentY);
        this.drawSentimentBar(doc, 'Négatif', report.sentimentAnalysis.sentiments.negatifPct, colors.danger, 380, sentY);

        doc.moveDown(4);

        // Résumé IA (Encadré sobre)
        if (report.sentimentAnalysis.summary) {
          doc.rect(50, doc.y, 495, 60).fill(colors.lightBg);
          doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold').text('SYNTHÈSE AUTOMATIQUE', 65, doc.y - 50);
          doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(report.sentimentAnalysis.summary, 65, doc.y + 5, { width: 465, align: 'justify' });
          doc.moveDown(3);
        }
      }

      // --- Détail des Questions ---
      doc.addPage();
      this.drawSectionTitle(doc, 'DÉTAIL DES QUESTIONS', colors);
      doc.moveDown(1);

      report.questions.forEach((q, index) => {
        // Gestion saut de page
        if (doc.y > 700) {
          doc.addPage();
          this.drawSectionTitle(doc, 'DÉTAIL DES QUESTIONS (Suite)', colors);
          doc.moveDown(1);
        }

        // En-tête question
        doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.primary).text(`Q${ index + 1 }. ${ q.enonce } `);
        doc.font('Helvetica').fontSize(9).fillColor(colors.secondaryText).text(`${ q.typeQuestion } • ${ q.totalReponses } réponses`);
        doc.moveDown(0.5);

        // Tableau de réponses (si QCM)
        if (q.typeQuestion === 'CHOIX_MULTIPLE' && q.distribution) {
          const tableTop = doc.y;
          const col1 = 50;
          const col2 = 350;
          const col3 = 450;
          
          // Header tableau
          doc.rect(col1, tableTop, 495, 20).fill(colors.lightBg);
          doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(9);
          doc.text('OPTION', col1 + 10, tableTop + 5);
          doc.text('RÉPONSES', col2, tableTop + 5, { width: 80, align: 'right' });
          doc.text('POURCENTAGE', col3, tableTop + 5, { width: 80, align: 'right' });

          let rowY = tableTop + 25;
          doc.font('Helvetica').fontSize(9).fillColor(colors.text);

          Object.entries(q.distribution).forEach(([option, count]) => {
            const pct = q.distributionPct[option];
            
            // Ligne
            doc.text(option, col1 + 10, rowY);
            doc.text(count.toString(), col2, rowY, { width: 80, align: 'right' });
            doc.text(`${ pct }% `, col3, rowY, { width: 80, align: 'right' });
            
            // Ligne de séparation fine
            doc.moveTo(col1, rowY + 12).lineTo(545, rowY + 12).strokeColor(colors.border).lineWidth(0.5).stroke();
            
            rowY += 18;
          });
          doc.y = rowY + 10;
        } else {
          doc.moveDown(1);
        }
        doc.moveDown(1);
      });

      // Pied de page global
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        // Ligne pied de page
        doc.moveTo(50, 780).lineTo(545, 780).strokeColor(colors.border).lineWidth(1).stroke();
        doc.fontSize(8).fillColor(colors.secondaryText).text(
          `EQuizz - Rapport généré automatiquement | Page ${ i + 1 } sur ${ range.count } `,
          50,
          790,
          { align: 'center', width: 495 }
        );
      }

      doc.end();
    });
  }

  // --- Helpers Design Professionnel ---

  drawSectionTitle(doc, title, colors) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.primary).text(title.toUpperCase());
    doc.rect(50, doc.y + 2, 495, 1).fill(colors.border);
    doc.moveDown(1);
  }

  drawInfoBlock(doc, label, value, x, y, width, colors) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.secondaryText).text(label, x, y);
    doc.font('Helvetica').fontSize(12).fillColor(colors.text).text(value, x, y + 12, { width: width, ellipsis: true });
  }

  drawKpiBox(doc, label, value, x, y, color) {
    // Juste le texte, propre et grand
    doc.font('Helvetica-Bold').fontSize(24).fillColor(color).text(value, x, y);
    doc.font('Helvetica').fontSize(9).fillColor('#7F8C8D').text(label, x, y + 28);
  }

  drawSentimentBar(doc, label, pct, color, x, y) {
    doc.font('Helvetica-Bold').fontSize(16).fillColor(color).text(`${ pct }% `, x, y);
    doc.font('Helvetica').fontSize(9).fillColor('#7F8C8D').text(label, x, y + 20);
    
    // Petite barre visuelle
    const barWidth = 100;
    doc.rect(x, y + 35, barWidth, 4).fill('#E5E7EB');
    doc.rect(x, y + 35, (parseFloat(pct) / 100) * barWidth, 4).fill(color);
  }
}

module.exports = new ReportService();
```
