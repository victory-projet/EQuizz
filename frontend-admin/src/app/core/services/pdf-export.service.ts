import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EvaluationReportData, McqQuestion, OpenQuestion } from './report.service';

// Étendre le type jsPDF pour inclure autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() {}

  /**
   * Exporter un rapport d'évaluation en PDF
   */
  exportEvaluationReport(data: EvaluationReportData): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Configuration des couleurs
    const primaryColor: [number, number, number] = [99, 102, 241]; // #6366f1
    const secondaryColor: [number, number, number] = [107, 114, 128]; // #6b7280
    const successColor: [number, number, number] = [16, 185, 129]; // #10b981

    // Titre principal
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(data.evaluation.titre, 20, yPosition);
    yPosition += 15;

    // Informations du cours
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text(`Cours: ${data.evaluation.cours?.nom || 'Non spécifié'}`, 20, yPosition);
    yPosition += 8;

    // Dates
    const dateDebut = new Date(data.evaluation.dateDebut).toLocaleDateString('fr-FR');
    const dateFin = new Date(data.evaluation.dateFin).toLocaleDateString('fr-FR');
    doc.text(`Période: ${dateDebut} - ${dateFin}`, 20, yPosition);
    yPosition += 15;

    // Statistiques principales
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('📊 Statistiques Générales', 20, yPosition);
    yPosition += 10;

    const statsData = [
      ['Étudiants ciblés', data.statistics.totalStudents.toString()],
      ['Répondants', data.statistics.totalRespondents.toString()],
      ['Taux de participation', `${data.statistics.participationRate}%`],
      ['Questions', data.statistics.totalQuestions.toString()],
      ['Score moyen', `${data.statistics.averageScore}%`],
      ['Temps moyen', `${data.statistics.averageTime} min`],
      ['Taux de réussite', `${data.statistics.successRate}%`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Questions QCM
    if (data.mcqQuestions.length > 0) {
      this.addMcqSection(doc, data.mcqQuestions, yPosition);
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Questions ouvertes
    if (data.openQuestions.length > 0) {
      this.addOpenQuestionsSection(doc, data.openQuestions, yPosition);
    }

    // Analyse des sentiments
    this.addSentimentSection(doc, data.sentimentData);

    // Télécharger le PDF
    const fileName = `rapport-${data.evaluation.titre.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private addMcqSection(doc: jsPDF, mcqQuestions: McqQuestion[], startY: number): void {
    const primaryColor: [number, number, number] = [99, 102, 241];
    
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('📊 Questions QCM - Répartition des Réponses', 20, startY);

    let yPosition = startY + 15;

    mcqQuestions.forEach((question, index) => {
      // Vérifier si on a assez de place, sinon nouvelle page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Titre de la question
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Question ${index + 1}: ${question.titre}`, 20, yPosition);
      yPosition += 10;

      // Tableau des options
      const optionsData = question.options.map(option => [
        option.texte,
        option.count.toString(),
        `${option.percentage}%`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Réponse', 'Nombre', 'Pourcentage']],
        body: optionsData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });
  }

  private addOpenQuestionsSection(doc: jsPDF, openQuestions: OpenQuestion[], startY: number): void {
    const primaryColor: [number, number, number] = [99, 102, 241];
    
    // Nouvelle page pour les questions ouvertes
    doc.addPage();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('💬 Questions Ouvertes - Réponses Anonymes', 20, yPosition);
    yPosition += 15;

    openQuestions.forEach((question, index) => {
      // Titre de la question
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Question ${index + 1}: ${question.titre}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`${question.responses.length} réponse(s) anonyme(s):`, 20, yPosition);
      yPosition += 8;

      // Réponses
      question.responses.forEach((response, responseIndex) => {
        // Vérifier si on a assez de place
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        // Numéro de réponse
        doc.text(`${responseIndex + 1}.`, 25, yPosition);
        
        // Texte de la réponse (avec retour à la ligne automatique)
        const responseText = response.texte;
        const splitText = doc.splitTextToSize(responseText, 160);
        doc.text(splitText, 35, yPosition);
        
        yPosition += splitText.length * 4 + 3;

        // Date de réponse
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        const dateStr = new Date(response.dateReponse).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Répondu le: ${dateStr}`, 35, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    });
  }

  private addSentimentSection(doc: jsPDF, sentimentData: any): void {
    const primaryColor: [number, number, number] = [99, 102, 241];
    
    // Nouvelle page pour l'analyse des sentiments
    doc.addPage();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('😊 Analyse des Sentiments', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Analyse automatique des réponses textuelles pour identifier les sentiments exprimés.', 20, yPosition);
    yPosition += 15;

    // Tableau des sentiments
    const sentimentTableData = [
      ['😊 Positif', `${sentimentData.positive}%`],
      ['😐 Neutre', `${sentimentData.neutral}%`],
      ['😞 Négatif', `${sentimentData.negative}%`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Sentiment', 'Pourcentage']],
      body: sentimentTableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' }
      }
    });

    // Pied de page avec date de génération
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 285);
      doc.text(`Page ${i} sur ${pageCount}`, 180, 285);
    }
  }
}