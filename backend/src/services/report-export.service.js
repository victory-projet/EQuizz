// backend/src/services/report-export.service.js

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const sentimentAnalysisService = require('./sentiment-analysis.service');

class ReportExportService {
  constructor() {
    this.defaultStyles = {
      header: {
        font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      },
      subHeader: {
        font: { bold: true, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      },
      data: {
        font: { size: 10 },
        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      },
      positive: {
        font: { size: 10, color: { argb: '008000' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } }
      },
      negative: {
        font: { size: 10, color: { argb: 'FF0000' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8' } }
      },
      neutral: {
        font: { size: 10, color: { argb: '666666' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F5F5' } }
      }
    };
  }

  /**
   * Exporte un rapport d'évaluation complet en Excel
   * @param {object} evaluation - Données de l'évaluation
   * @param {Array} submissions - Soumissions des étudiants
   * @param {object} options - Options d'export
   * @returns {Buffer} Buffer du fichier Excel
   */
  async exportEvaluationToExcel(evaluation, submissions, options = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Métadonnées du workbook
    workbook.creator = 'Système d\'Évaluation';
    workbook.lastModifiedBy = 'Système d\'Évaluation';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Feuille de résumé
    await this.createSummarySheet(workbook, evaluation, submissions);
    
    // Feuille des réponses détaillées
    await this.createDetailedResponsesSheet(workbook, evaluation, submissions);
    
    // Feuille d'analyse des sentiments
    if (options.includeSentimentAnalysis !== false) {
      await this.createSentimentAnalysisSheet(workbook, submissions);
    }
    
    // Feuille des statistiques
    await this.createStatisticsSheet(workbook, evaluation, submissions);
    
    // Feuille des graphiques (données pour graphiques)
    if (options.includeChartData !== false) {
      await this.createChartDataSheet(workbook, submissions);
    }

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Crée la feuille de résumé
   */
  async createSummarySheet(workbook, evaluation, submissions) {
    const worksheet = workbook.addWorksheet('Résumé', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // En-tête principal
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Rapport d'Évaluation - ${evaluation.titre}`;
    titleCell.style = {
      font: { bold: true, size: 16, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    worksheet.getRow(1).height = 30;

    // Informations générales
    let currentRow = 3;
    const infoData = [
      ['Cours', evaluation.Cours?.nom || 'N/A'],
      ['Date de création', new Date(evaluation.createdAt).toLocaleDateString('fr-FR')],
      ['Statut', evaluation.statut],
      ['Nombre de questions', evaluation.Quizz?.Questions?.length || 0],
      ['Nombre de soumissions', submissions.length],
      ['Taux de participation', `${submissions.length} étudiants`]
    ];

    worksheet.getCell('A2').value = 'Informations Générales';
    worksheet.getCell('A2').style = this.defaultStyles.subHeader;
    worksheet.mergeCells('A2:B2');

    infoData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).style = { font: { bold: true } };
      currentRow++;
    });

    // Statistiques rapides
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'Statistiques Rapides';
    worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    currentRow++;

    const completedSubmissions = submissions.filter(s => s.estTermine);
    const avgCompletionTime = this.calculateAverageCompletionTime(completedSubmissions);

    const statsData = [
      ['Soumissions complètes', completedSubmissions.length],
      ['Soumissions en cours', submissions.length - completedSubmissions.length],
      ['Temps moyen de completion', avgCompletionTime],
      ['Taux de completion', `${Math.round((completedSubmissions.length / submissions.length) * 100)}%`]
    ];

    statsData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).style = { font: { bold: true } };
      currentRow++;
    });

    // Ajuster les largeurs des colonnes
    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('B').width = 20;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 15;
  }

  /**
   * Crée la feuille des réponses détaillées
   */
  async createDetailedResponsesSheet(workbook, evaluation, submissions) {
    const worksheet = workbook.addWorksheet('Réponses Détaillées');

    // En-têtes
    const headers = [
      'Étudiant',
      'Classe',
      'Email',
      'Date Début',
      'Date Fin',
      'Statut',
      'Question',
      'Réponse',
      'Type Question'
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(1, index + 1);
      cell.value = header;
      cell.style = this.defaultStyles.header;
    });

    // Données
    let currentRow = 2;
    submissions.forEach(submission => {
      const baseInfo = [
        `${submission.etudiant.prenom} ${submission.etudiant.nom}`,
        submission.etudiant.classe || 'N/A',
        submission.etudiant.email,
        new Date(submission.dateDebut).toLocaleString('fr-FR'),
        submission.dateFin ? new Date(submission.dateFin).toLocaleString('fr-FR') : 'En cours',
        submission.estTermine ? 'Terminé' : 'En cours'
      ];

      if (submission.reponses && submission.reponses.length > 0) {
        submission.reponses.forEach(reponse => {
          const row = worksheet.getRow(currentRow);
          baseInfo.forEach((info, index) => {
            row.getCell(index + 1).value = info;
            row.getCell(index + 1).style = this.defaultStyles.data;
          });

          // Ajouter les données de la réponse
          row.getCell(7).value = reponse.question;
          row.getCell(8).value = reponse.reponse;
          row.getCell(9).value = reponse.typeQuestion || 'N/A';

          // Style conditionnel basé sur le statut
          if (!submission.estTermine) {
            row.eachCell(cell => {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
            });
          }

          currentRow++;
        });
      } else {
        // Étudiant sans réponses
        const row = worksheet.getRow(currentRow);
        baseInfo.forEach((info, index) => {
          row.getCell(index + 1).value = info;
          row.getCell(index + 1).style = this.defaultStyles.data;
        });
        row.getCell(7).value = 'Aucune réponse';
        row.getCell(8).value = '';
        row.getCell(9).value = '';
        currentRow++;
      }
    });

    // Ajuster les largeurs des colonnes
    worksheet.getColumn(1).width = 20; // Étudiant
    worksheet.getColumn(2).width = 15; // Classe
    worksheet.getColumn(3).width = 25; // Email
    worksheet.getColumn(4).width = 18; // Date Début
    worksheet.getColumn(5).width = 18; // Date Fin
    worksheet.getColumn(6).width = 12; // Statut
    worksheet.getColumn(7).width = 40; // Question
    worksheet.getColumn(8).width = 50; // Réponse
    worksheet.getColumn(9).width = 15; // Type Question

    // Filtres automatiques
    worksheet.autoFilter = {
      from: 'A1',
      to: `I${currentRow - 1}`
    };
  }

  /**
   * Crée la feuille d'analyse des sentiments
   */
  async createSentimentAnalysisSheet(workbook, submissions) {
    const worksheet = workbook.addWorksheet('Analyse des Sentiments');

    // Collecter toutes les réponses textuelles
    const textResponses = [];
    submissions.forEach(submission => {
      if (submission.reponses) {
        submission.reponses.forEach(reponse => {
          if (reponse.reponse && typeof reponse.reponse === 'string' && reponse.reponse.length > 10) {
            textResponses.push({
              studentName: `${submission.etudiant.prenom} ${submission.etudiant.nom}`,
              studentEmail: submission.etudiant.email,
              question: reponse.question,
              response: reponse.reponse,
              submissionId: submission.id
            });
          }
        });
      }
    });

    if (textResponses.length === 0) {
      worksheet.getCell('A1').value = 'Aucune réponse textuelle trouvée pour l\'analyse des sentiments.';
      return;
    }

    // Analyser les sentiments
    const sentimentAnalysis = sentimentAnalysisService.analyzeEvaluationResponses(
      textResponses.map(r => ({ contenu: r.response, id: r.submissionId }))
    );

    // En-tête de résumé
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Analyse des Sentiments - Résumé Global';
    titleCell.style = this.defaultStyles.header;

    // Résumé global
    let currentRow = 3;
    const summaryData = [
      ['Sentiment Global', sentimentAnalysis.globalSentiment],
      ['Score Moyen', sentimentAnalysis.averageScore.toFixed(2)],
      ['Total Réponses Analysées', sentimentAnalysis.totalResponses],
      ['Réponses Positives', sentimentAnalysis.distribution.POSITIF],
      ['Réponses Négatives', sentimentAnalysis.distribution.NEGATIF],
      ['Réponses Neutres', sentimentAnalysis.distribution.NEUTRE]
    ];

    summaryData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).style = { font: { bold: true } };
      
      // Coloration conditionnelle pour le sentiment global
      if (label === 'Sentiment Global') {
        const cell = worksheet.getCell(`B${currentRow}`);
        if (value === 'POSITIF') {
          cell.style = this.defaultStyles.positive;
        } else if (value === 'NEGATIF') {
          cell.style = this.defaultStyles.negative;
        } else {
          cell.style = this.defaultStyles.neutral;
        }
      }
      
      currentRow++;
    });

    // Insights
    if (sentimentAnalysis.insights && sentimentAnalysis.insights.length > 0) {
      currentRow += 2;
      worksheet.getCell(`A${currentRow}`).value = 'Insights Automatiques';
      worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      currentRow++;

      sentimentAnalysis.insights.forEach(insight => {
        worksheet.getCell(`A${currentRow}`).value = `• ${insight.message}`;
        worksheet.getCell(`A${currentRow}`).style = { font: { italic: true } };
        currentRow++;
      });
    }

    // Détails par réponse
    currentRow += 2;
    const detailHeaders = ['Étudiant', 'Email', 'Question', 'Réponse', 'Sentiment', 'Score', 'Confiance'];
    detailHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.style = this.defaultStyles.header;
    });
    currentRow++;

    // Données détaillées
    sentimentAnalysis.detailedAnalysis.forEach((analysis, index) => {
      const response = textResponses[index];
      const row = worksheet.getRow(currentRow);
      
      row.getCell(1).value = response.studentName;
      row.getCell(2).value = response.studentEmail;
      row.getCell(3).value = response.question.substring(0, 50) + '...';
      row.getCell(4).value = response.response.substring(0, 100) + '...';
      row.getCell(5).value = analysis.classification;
      row.getCell(6).value = analysis.score.toFixed(2);
      row.getCell(7).value = analysis.confidence.toFixed(2);

      // Style conditionnel basé sur le sentiment
      const sentimentCell = row.getCell(5);
      if (analysis.classification === 'POSITIF') {
        sentimentCell.style = this.defaultStyles.positive;
      } else if (analysis.classification === 'NEGATIF') {
        sentimentCell.style = this.defaultStyles.negative;
      } else {
        sentimentCell.style = this.defaultStyles.neutral;
      }

      row.eachCell((cell, colNumber) => {
        if (colNumber !== 5) { // Sauf la colonne sentiment qui a déjà son style
          cell.style = this.defaultStyles.data;
        }
      });

      currentRow++;
    });

    // Ajuster les largeurs des colonnes
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(5).width = 12;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 12;
  }

  /**
   * Crée la feuille des statistiques
   */
  async createStatisticsSheet(workbook, evaluation, submissions) {
    const worksheet = workbook.addWorksheet('Statistiques');

    // Titre
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Statistiques Détaillées';
    titleCell.style = this.defaultStyles.header;

    let currentRow = 3;

    // Statistiques de participation
    worksheet.getCell(`A${currentRow}`).value = 'Participation';
    worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    currentRow++;

    const participationStats = this.calculateParticipationStats(submissions);
    Object.entries(participationStats).forEach(([key, value]) => {
      worksheet.getCell(`A${currentRow}`).value = key;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).style = { font: { bold: true } };
      currentRow++;
    });

    // Statistiques temporelles
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'Analyse Temporelle';
    worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    currentRow++;

    const timeStats = this.calculateTimeStats(submissions);
    Object.entries(timeStats).forEach(([key, value]) => {
      worksheet.getCell(`A${currentRow}`).value = key;
      worksheet.getCell(`B${currentRow}`).value = value;
      worksheet.getCell(`A${currentRow}`).style = { font: { bold: true } };
      currentRow++;
    });

    // Statistiques par question (si disponible)
    if (evaluation.Quizz && evaluation.Quizz.Questions) {
      currentRow += 2;
      worksheet.getCell(`A${currentRow}`).value = 'Statistiques par Question';
      worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      currentRow++;

      const questionStats = this.calculateQuestionStats(evaluation.Quizz.Questions, submissions);
      questionStats.forEach(stat => {
        worksheet.getCell(`A${currentRow}`).value = stat.question.substring(0, 50) + '...';
        worksheet.getCell(`B${currentRow}`).value = `${stat.responseCount} réponses`;
        worksheet.getCell(`C${currentRow}`).value = `${stat.responseRate}% taux de réponse`;
        currentRow++;
      });
    }

    // Ajuster les largeurs des colonnes
    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 20;
    worksheet.getColumn('C').width = 20;
    worksheet.getColumn('D').width = 20;
  }

  /**
   * Crée la feuille des données pour graphiques
   */
  async createChartDataSheet(workbook, submissions) {
    const worksheet = workbook.addWorksheet('Données Graphiques');

    // Distribution des soumissions par jour
    const submissionsByDay = this.groupSubmissionsByDay(submissions);
    
    worksheet.getCell('A1').value = 'Distribution des Soumissions par Jour';
    worksheet.getCell('A1').style = this.defaultStyles.subHeader;
    worksheet.mergeCells('A1:B1');

    worksheet.getCell('A2').value = 'Date';
    worksheet.getCell('B2').value = 'Nombre de Soumissions';
    worksheet.getRow(2).eachCell(cell => {
      cell.style = this.defaultStyles.header;
    });

    let currentRow = 3;
    Object.entries(submissionsByDay).forEach(([date, count]) => {
      worksheet.getCell(`A${currentRow}`).value = date;
      worksheet.getCell(`B${currentRow}`).value = count;
      currentRow++;
    });

    // Distribution des statuts
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'Distribution des Statuts';
    worksheet.getCell(`A${currentRow}`).style = this.defaultStyles.subHeader;
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Statut';
    worksheet.getCell(`B${currentRow}`).value = 'Nombre';
    worksheet.getRow(currentRow).eachCell(cell => {
      cell.style = this.defaultStyles.header;
    });
    currentRow++;

    const statusDistribution = this.calculateStatusDistribution(submissions);
    Object.entries(statusDistribution).forEach(([status, count]) => {
      worksheet.getCell(`A${currentRow}`).value = status;
      worksheet.getCell(`B${currentRow}`).value = count;
      currentRow++;
    });
  }

  /**
   * Calcule les statistiques de participation
   */
  calculateParticipationStats(submissions) {
    const total = submissions.length;
    const completed = submissions.filter(s => s.estTermine).length;
    const inProgress = total - completed;

    return {
      'Total des étudiants': total,
      'Soumissions complètes': completed,
      'Soumissions en cours': inProgress,
      'Taux de completion': `${Math.round((completed / total) * 100)}%`,
      'Taux d\'abandon': `${Math.round((inProgress / total) * 100)}%`
    };
  }

  /**
   * Calcule les statistiques temporelles
   */
  calculateTimeStats(submissions) {
    const completedSubmissions = submissions.filter(s => s.estTermine && s.dateDebut && s.dateFin);
    
    if (completedSubmissions.length === 0) {
      return {
        'Temps moyen de completion': 'N/A',
        'Temps minimum': 'N/A',
        'Temps maximum': 'N/A'
      };
    }

    const durations = completedSubmissions.map(s => {
      const start = new Date(s.dateDebut);
      const end = new Date(s.dateFin);
      return (end - start) / (1000 * 60); // en minutes
    });

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      'Temps moyen de completion': `${Math.round(avgDuration)} minutes`,
      'Temps minimum': `${Math.round(minDuration)} minutes`,
      'Temps maximum': `${Math.round(maxDuration)} minutes`,
      'Médiane': `${Math.round(this.calculateMedian(durations))} minutes`
    };
  }

  /**
   * Calcule les statistiques par question
   */
  calculateQuestionStats(questions, submissions) {
    return questions.map(question => {
      const responseCount = submissions.reduce((count, submission) => {
        const hasResponse = submission.reponses && 
          submission.reponses.some(r => r.questionId === question.id);
        return count + (hasResponse ? 1 : 0);
      }, 0);

      return {
        question: question.enonce,
        responseCount,
        responseRate: Math.round((responseCount / submissions.length) * 100)
      };
    });
  }

  /**
   * Groupe les soumissions par jour
   */
  groupSubmissionsByDay(submissions) {
    const groups = {};
    
    submissions.forEach(submission => {
      const date = new Date(submission.dateDebut).toLocaleDateString('fr-FR');
      groups[date] = (groups[date] || 0) + 1;
    });

    return groups;
  }

  /**
   * Calcule la distribution des statuts
   */
  calculateStatusDistribution(submissions) {
    return submissions.reduce((dist, submission) => {
      const status = submission.estTermine ? 'Terminé' : 'En cours';
      dist[status] = (dist[status] || 0) + 1;
      return dist;
    }, {});
  }

  /**
   * Calcule le temps moyen de completion
   */
  calculateAverageCompletionTime(completedSubmissions) {
    if (completedSubmissions.length === 0) return 'N/A';

    const totalMinutes = completedSubmissions.reduce((sum, submission) => {
      if (submission.dateDebut && submission.dateFin) {
        const start = new Date(submission.dateDebut);
        const end = new Date(submission.dateFin);
        return sum + ((end - start) / (1000 * 60));
      }
      return sum;
    }, 0);

    const avgMinutes = totalMinutes / completedSubmissions.length;
    return `${Math.round(avgMinutes)} minutes`;
  }

  /**
   * Calcule la médiane d'un tableau de nombres
   */
  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * Exporte en format PDF (version simplifiée)
   */
  async exportEvaluationToPDF(evaluation, submissions, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Titre
        doc.fontSize(20).text(`Rapport d'Évaluation - ${evaluation.titre}`, 50, 50);
        
        // Informations générales
        doc.fontSize(14).text('Informations Générales', 50, 100);
        doc.fontSize(12)
          .text(`Cours: ${evaluation.Cours?.nom || 'N/A'}`, 50, 120)
          .text(`Date de création: ${new Date(evaluation.createdAt).toLocaleDateString('fr-FR')}`, 50, 140)
          .text(`Statut: ${evaluation.statut}`, 50, 160)
          .text(`Nombre de soumissions: ${submissions.length}`, 50, 180);

        // Statistiques
        const completedSubmissions = submissions.filter(s => s.estTermine);
        doc.fontSize(14).text('Statistiques', 50, 220);
        doc.fontSize(12)
          .text(`Soumissions complètes: ${completedSubmissions.length}`, 50, 240)
          .text(`Taux de completion: ${Math.round((completedSubmissions.length / submissions.length) * 100)}%`, 50, 260);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportExportService();