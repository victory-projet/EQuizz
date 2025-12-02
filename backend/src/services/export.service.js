// backend/src/services/export.service.js

const ExcelJS = require('exceljs');
const db = require('../models');

class ExportService {
  /**
   * Exporte les résultats d'une évaluation en Excel (VERSION ANONYME)
   * Respecte l'anonymat complet des étudiants
   */
  async exportEvaluationToExcel(evaluationId, classeId = null) {
    const reportService = require('./report.service');
    
    // Générer le rapport anonyme
    const report = await reportService.generateReport(evaluationId, classeId);
    
    const workbook = new ExcelJS.Workbook();
    
    // Feuille 1: Statistiques globales (ANONYME)
    const statsSheet = workbook.addWorksheet('Statistiques');
    statsSheet.columns = [
      { header: 'Métrique', key: 'metric', width: 35 },
      { header: 'Valeur', key: 'value', width: 20 }
    ];
    
    // Style pour l'en-tête
    statsSheet.getRow(1).font = { bold: true, size: 12 };
    statsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    statsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    statsSheet.addRow({ metric: 'Évaluation', value: report.evaluation.titre });
    statsSheet.addRow({ metric: 'Cours', value: report.evaluation.cours });
    statsSheet.addRow({ metric: 'Date début', value: new Date(report.evaluation.dateDebut).toLocaleDateString('fr-FR') });
    statsSheet.addRow({ metric: 'Date fin', value: new Date(report.evaluation.dateFin).toLocaleDateString('fr-FR') });
    statsSheet.addRow({ metric: 'Statut', value: report.evaluation.statut });
    statsSheet.addRow({});
    statsSheet.addRow({ metric: 'Total étudiants ciblés', value: report.statistics.totalEtudiants });
    statsSheet.addRow({ metric: 'Nombre de répondants', value: report.statistics.nombreRepondants });
    statsSheet.addRow({ metric: 'Taux de participation', value: `${report.statistics.tauxParticipation}%` });
    
    // Feuille 2: Analyse des sentiments (ANONYME)
    if (report.sentimentAnalysis && report.sentimentAnalysis.total > 0) {
      const sentimentSheet = workbook.addWorksheet('Analyse Sentiments');
      sentimentSheet.columns = [
        { header: 'Sentiment', key: 'sentiment', width: 20 },
        { header: 'Nombre', key: 'count', width: 15 },
        { header: 'Pourcentage', key: 'percentage', width: 15 }
      ];
      
      // Style pour l'en-tête
      sentimentSheet.getRow(1).font = { bold: true, size: 12 };
      sentimentSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' }
      };
      sentimentSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      sentimentSheet.addRow({
        sentiment: 'Positif 😊',
        count: report.sentimentAnalysis.sentiments.positif,
        percentage: `${report.sentimentAnalysis.sentiments.positifPct}%`
      });
      sentimentSheet.addRow({
        sentiment: 'Neutre 😐',
        count: report.sentimentAnalysis.sentiments.neutre,
        percentage: `${report.sentimentAnalysis.sentiments.neutrePct}%`
      });
      sentimentSheet.addRow({
        sentiment: 'Négatif 😞',
        count: report.sentimentAnalysis.sentiments.negatif,
        percentage: `${report.sentimentAnalysis.sentiments.negatifPct}%`
      });
      
      // Mots-clés
      if (report.sentimentAnalysis.keywords && report.sentimentAnalysis.keywords.length > 0) {
        sentimentSheet.addRow({});
        sentimentSheet.addRow({ sentiment: 'Mots-clés principaux', count: 'Fréquence' });
        
        report.sentimentAnalysis.keywords.slice(0, 15).forEach(kw => {
          sentimentSheet.addRow({ 
            sentiment: kw.word, 
            count: kw.count 
          });
        });
      }
      
      // Résumé IA
      if (report.sentimentAnalysis.summary) {
        sentimentSheet.addRow({});
        sentimentSheet.addRow({ sentiment: 'Résumé généré par IA' });
        sentimentSheet.addRow({ 
          sentiment: report.sentimentAnalysis.summary 
        });
        sentimentSheet.getRow(sentimentSheet.rowCount).alignment = { wrapText: true };
      }
    }
    
    // Feuille 3: Questions (ANONYME - sans réponses individuelles)
    if (report.questions && report.questions.length > 0) {
      const questionsSheet = workbook.addWorksheet('Questions');
      questionsSheet.columns = [
        { header: 'N°', key: 'numero', width: 8 },
        { header: 'Question', key: 'enonce', width: 50 },
        { header: 'Type', key: 'type', width: 20 }
      ];
      
      // Style pour l'en-tête
      questionsSheet.getRow(1).font = { bold: true, size: 12 };
      questionsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' }
      };
      questionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      report.questions.forEach((q, index) => {
        questionsSheet.addRow({
          numero: index + 1,
          enonce: q.enonce,
          type: q.type
        });
      });
    }
    
    // Note d'anonymat
    const noteSheet = workbook.addWorksheet('Note Importante');
    noteSheet.columns = [
      { header: 'Information', key: 'info', width: 80 }
    ];
    
    noteSheet.addRow({ info: '🔒 ANONYMAT RESPECTÉ' });
    noteSheet.addRow({});
    noteSheet.addRow({ info: 'Ce rapport respecte l\'anonymat complet des étudiants.' });
    noteSheet.addRow({ info: 'Aucune donnée personnelle (nom, prénom, email) n\'est incluse.' });
    noteSheet.addRow({ info: 'Seules des statistiques agrégées sont présentées.' });
    noteSheet.addRow({});
    noteSheet.addRow({ info: 'Conformité RGPD : ✅' });
    noteSheet.addRow({ info: 'Date d\'export : ' + new Date().toLocaleString('fr-FR') });
    
    return workbook;
  }

  /**
   * Exporte la liste des étudiants d'une classe (ADMIN UNIQUEMENT)
   * Cette méthode est réservée à la gestion administrative
   */
  async exportStudentsList(classeId) {
    const classe = await db.Classe.findByPk(classeId, {
      include: [
        {
          model: db.Etudiant,
          include: [{ model: db.Utilisateur }]
        },
        { model: db.AnneeAcademique }
      ]
    });

    if (!classe) {
      throw new Error('Classe non trouvée');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Étudiants');
    
    sheet.columns = [
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Classe', key: 'classe', width: 15 }
    ];

    // Style pour l'en-tête
    sheet.getRow(1).font = { bold: true, size: 12 };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    classe.Etudiants.forEach(etudiant => {
      sheet.addRow({
        matricule: etudiant.matricule,
        nom: etudiant.Utilisateur.nom,
        prenom: etudiant.Utilisateur.prenom,
        email: etudiant.Utilisateur.email,
        classe: classe.nom
      });
    });

    return workbook;
  }

  /**
   * Exporte la liste des cours (ADMIN UNIQUEMENT)
   */
  async exportCoursesList() {
    const cours = await db.Cours.findAll({
      include: [
        { model: db.Enseignant, include: [{ model: db.Utilisateur }] },
        { model: db.Semestre }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cours');
    
    sheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Nom', key: 'nom', width: 30 },
      { header: 'Enseignant', key: 'enseignant', width: 30 },
      { header: 'Semestre', key: 'semestre', width: 20 }
    ];

    // Style pour l'en-tête
    sheet.getRow(1).font = { bold: true, size: 12 };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    cours.forEach(c => {
      sheet.addRow({
        code: c.code,
        nom: c.nom,
        enseignant: c.Enseignant 
          ? `${c.Enseignant.Utilisateur.prenom} ${c.Enseignant.Utilisateur.nom}`
          : 'Non assigné',
        semestre: c.Semestre?.nom || 'N/A'
      });
    });

    return workbook;
  }
}

module.exports = new ExportService();
