// src/app/core/services/export.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
  title: string;
  date: string;
  stats?: Array<{ label: string; value: string | number }>;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: any[][];
  }>;
  additionalInfo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporte les données en PDF
   */
  exportToPDF(data: ExportData): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Titre
    doc.setFontSize(20);
    doc.setTextColor(117, 113, 249); // Couleur primaire
    doc.text(data.title, 105, yPosition, { align: 'center' });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Date d'export: ${data.date}`, 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Statistiques
    if (data.stats && data.stats.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(52, 57, 87);
      doc.text('Statistiques', 14, yPosition);
      yPosition += 10;

      const statsData = data.stats.map(stat => [stat.label, String(stat.value)]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Indicateur', 'Valeur']],
        body: statsData,
        theme: 'grid',
        headStyles: {
          fillColor: [117, 113, 249],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Tables supplémentaires
    if (data.tables && data.tables.length > 0) {
      data.tables.forEach((table, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(52, 57, 87);
        doc.text(table.title, 14, yPosition);
        yPosition += 10;

        autoTable(doc, {
          startY: yPosition,
          head: [table.headers],
          body: table.rows,
          theme: 'striped',
          headStyles: {
            fillColor: [117, 113, 249],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [243, 243, 249]
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      });
    }

    // Informations additionnelles
    if (data.additionalInfo) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(data.additionalInfo, 14, yPosition, { maxWidth: 180 });
    }

    // Télécharger le PDF
    const fileName = `${this.sanitizeFileName(data.title)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Exporte les données en Excel
   */
  exportToExcel(data: ExportData): void {
    const workbook = XLSX.utils.book_new();

    // Feuille de statistiques
    if (data.stats && data.stats.length > 0) {
      const statsData = [
        ['Rapport:', data.title],
        ['Date:', data.date],
        [],
        ['Indicateur', 'Valeur'],
        ...data.stats.map(stat => [stat.label, stat.value])
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      
      // Styliser les en-têtes (largeur des colonnes)
      statsSheet['!cols'] = [
        { wch: 30 },
        { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
    }

    // Feuilles pour les tables supplémentaires
    if (data.tables && data.tables.length > 0) {
      data.tables.forEach((table, index) => {
        const tableData = [
          [table.title],
          [],
          table.headers,
          ...table.rows
        ];

        const tableSheet = XLSX.utils.aoa_to_sheet(tableData);
        
        // Largeur automatique des colonnes
        const colWidths = table.headers.map(() => ({ wch: 20 }));
        tableSheet['!cols'] = colWidths;

        const sheetName = table.title.substring(0, 31); // Excel limite à 31 caractères
        XLSX.utils.book_append_sheet(workbook, tableSheet, sheetName);
      });
    }

    // Télécharger le fichier Excel
    const fileName = `${this.sanitizeFileName(data.title)}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Exporte les données en JSON
   */
  exportToJSON(data: any, fileName: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFileName(fileName)}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Nettoie le nom de fichier
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
  }
}
