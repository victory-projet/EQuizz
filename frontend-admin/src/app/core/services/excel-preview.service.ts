import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

export interface ExcelPreviewData {
  fileName: string;
  fileSize: number;
  sheets: ExcelSheetPreview[];
  totalRows: number;
  totalColumns: number;
  hasErrors: boolean;
  errors: ExcelValidationError[];
  warnings: ExcelValidationWarning[];
  metadata?: {
    creator?: string;
    application?: string;
    created?: Date;
  };
}

export interface ExcelSheetPreview {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  data: any[][];
  isActive: boolean;
  hasData: boolean;
  duplicateRows?: number[];
  emptyRows?: number[];
}

export interface ExcelValidationError {
  type: 'missing_header' | 'invalid_type' | 'empty_required' | 'invalid_format' | 'duplicate_data';
  message: string;
  sheet: string;
  row?: number;
  column?: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ExcelValidationWarning {
  type: 'empty_cell' | 'long_text' | 'special_characters' | 'potential_duplicate';
  message: string;
  sheet: string;
  row?: number;
  column?: string;
  suggestion?: string;
}

export interface ExcelImportConfig {
  expectedHeaders: string[];
  requiredColumns: string[];
  maxRows?: number;
  maxFileSize?: number; // en bytes
  allowedSheets?: string[];
  dataValidators?: { [column: string]: (value: any) => boolean };
  allowDuplicates?: boolean;
  trimWhitespace?: boolean;
  skipEmptyRows?: boolean;
}

export interface ExcelDataStatistics {
  totalCells: number;
  filledCells: number;
  fillRate: number;
  averageRowLength: number;
  dataTypes: { [type: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ExcelPreviewService {

  /**
   * Analyse un fichier Excel et retourne une prévisualisation détaillée
   */
  async analyzeExcelFile(file: File, config?: ExcelImportConfig): Promise<ExcelPreviewData> {
    const workbook = new ExcelJS.Workbook();
    
    try {
      // Lire le fichier
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheets: ExcelSheetPreview[] = [];
      let totalRows = 0;
      let totalColumns = 0;
      const errors: ExcelValidationError[] = [];
      const warnings: ExcelValidationWarning[] = [];

      // Analyser chaque feuille
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetPreview = this.analyzeWorksheet(worksheet, config);
        sheets.push(sheetPreview);
        
        totalRows += sheetPreview.rowCount;
        totalColumns = Math.max(totalColumns, sheetPreview.columnCount);

        // Validation de la feuille
        const sheetValidation = this.validateSheet(sheetPreview, config);
        errors.push(...sheetValidation.errors);
        warnings.push(...sheetValidation.warnings);
      });

      // Validation globale du fichier
      const fileValidation = this.validateFile(file, sheets, config);
      errors.push(...fileValidation.errors);
      warnings.push(...fileValidation.warnings);

      return {
        fileName: file.name,
        fileSize: file.size,
        sheets,
        totalRows,
        totalColumns,
        hasErrors: errors.some(e => e.severity === 'error'),
        errors,
        warnings
      };

    } catch (error) {
      throw new Error(`Erreur lors de l'analyse du fichier Excel: ${error}`);
    }
  }

  /**
   * Analyse une feuille de calcul spécifique
   */
  private analyzeWorksheet(worksheet: ExcelJS.Worksheet, config?: ExcelImportConfig): ExcelSheetPreview {
    const headers: string[] = [];
    const data: any[][] = [];
    let rowCount = 0;
    let columnCount = 0;

    // Obtenir les en-têtes (première ligne)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.text || '';
      columnCount = Math.max(columnCount, colNumber);
    });

    // Obtenir les données (lignes 2 et suivantes)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData[colNumber - 1] = this.getCellValue(cell);
      });
      
      // Ne pas ajouter les lignes complètement vides
      if (rowData.some(cell => cell !== null && cell !== undefined && cell !== '')) {
        data.push(rowData);
        rowCount++;
      }
    });

    return {
      name: worksheet.name,
      rowCount,
      columnCount,
      headers,
      data: data.slice(0, 10), // Limiter à 10 lignes pour la prévisualisation
      isActive: worksheet.state === 'visible',
      hasData: data.length > 0
    };
  }

  /**
   * Extrait la valeur d'une cellule en gérant les différents types
   */
  private getCellValue(cell: ExcelJS.Cell): any {
    if (cell.value === null || cell.value === undefined) {
      return '';
    }

    // Gérer les formules
    if (cell.formula) {
      return cell.result || cell.text || '';
    }

    // Gérer les dates
    if (cell.value instanceof Date) {
      return cell.value.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }

    // Gérer les objets riches (liens, etc.)
    if (typeof cell.value === 'object' && 'text' in cell.value) {
      return cell.value.text;
    }

    return cell.text || cell.value || '';
  }

  /**
   * Valide une feuille selon la configuration
   */
  private validateSheet(sheet: ExcelSheetPreview, config?: ExcelImportConfig): {
    errors: ExcelValidationError[];
    warnings: ExcelValidationWarning[];
  } {
    const errors: ExcelValidationError[] = [];
    const warnings: ExcelValidationWarning[] = [];

    if (!config) return { errors, warnings };

    // Vérifier les en-têtes attendus
    if (config.expectedHeaders) {
      config.expectedHeaders.forEach(expectedHeader => {
        if (!sheet.headers.includes(expectedHeader)) {
          errors.push({
            type: 'missing_header',
            message: `En-tête manquant: "${expectedHeader}"`,
            sheet: sheet.name,
            severity: 'error'
          });
        }
      });
    }

    // Vérifier les colonnes requises
    if (config.requiredColumns) {
      config.requiredColumns.forEach(requiredColumn => {
        const columnIndex = sheet.headers.indexOf(requiredColumn);
        if (columnIndex === -1) {
          errors.push({
            type: 'missing_header',
            message: `Colonne requise manquante: "${requiredColumn}"`,
            sheet: sheet.name,
            severity: 'error'
          });
        } else {
          // Vérifier que la colonne n'est pas vide
          const hasData = sheet.data.some(row => {
            const cellValue = row[columnIndex];
            return cellValue !== null && cellValue !== undefined && cellValue !== '';
          });

          if (!hasData) {
            warnings.push({
              type: 'empty_cell',
              message: `La colonne "${requiredColumn}" semble vide`,
              sheet: sheet.name,
              column: requiredColumn
            });
          }
        }
      });
    }

    // Vérifier le nombre maximum de lignes
    if (config.maxRows && sheet.rowCount > config.maxRows) {
      errors.push({
        type: 'invalid_format',
        message: `Trop de lignes: ${sheet.rowCount} (maximum: ${config.maxRows})`,
        sheet: sheet.name,
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Valide le fichier globalement
   */
  private validateFile(file: File, sheets: ExcelSheetPreview[], config?: ExcelImportConfig): {
    errors: ExcelValidationError[];
    warnings: ExcelValidationWarning[];
  } {
    const errors: ExcelValidationError[] = [];
    const warnings: ExcelValidationWarning[] = [];

    // Vérifier la taille du fichier
    if (config?.maxFileSize && file.size > config.maxFileSize) {
      errors.push({
        type: 'invalid_format',
        message: `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB (maximum: ${(config.maxFileSize / 1024 / 1024).toFixed(2)}MB)`,
        sheet: 'Fichier',
        severity: 'error'
      });
    }

    // Vérifier qu'il y a au moins une feuille avec des données
    const sheetsWithData = sheets.filter(sheet => sheet.hasData);
    if (sheetsWithData.length === 0) {
      errors.push({
        type: 'empty_required',
        message: 'Aucune feuille ne contient de données',
        sheet: 'Fichier',
        severity: 'error'
      });
    }

    return { errors, warnings };
  }

  /**
   * Génère des statistiques sur les données
   */
  generateDataStatistics(previewData: ExcelPreviewData): ExcelDataStatistics {
    let totalCells = 0;
    let filledCells = 0;
    const dataTypes: { [type: string]: number } = {};

    previewData.sheets.forEach(sheet => {
      sheet.data.forEach(row => {
        row.forEach(cell => {
          totalCells++;
          
          if (cell !== null && cell !== undefined && cell !== '') {
            filledCells++;
            
            const type = this.getDataType(cell);
            dataTypes[type] = (dataTypes[type] || 0) + 1;
          }
        });
      });
    });

    return {
      totalCells,
      filledCells,
      fillRate: totalCells > 0 ? (filledCells / totalCells) * 100 : 0,
      averageRowLength: previewData.sheets.length > 0 
        ? previewData.sheets.reduce((sum, sheet) => sum + sheet.columnCount, 0) / previewData.sheets.length 
        : 0,
      dataTypes
    };
  }

  /**
   * Détecte le type de données d'une cellule
   */
  private getDataType(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'empty';
    }
    
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'decimal';
    }
    
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    
    if (value instanceof Date) {
      return 'date';
    }
    
    if (typeof value === 'string') {
      // Vérifier si c'est un email
      if (value.includes('@') && value.includes('.') && value.length > 5) {
        return 'email';
      }
      
      // Vérifier si c'est un nombre en string
      if (!isNaN(Number(value)) && value.trim() !== '') {
        return 'number_string';
      }
      
      // Vérifier si c'est une date en string
      if (!isNaN(Date.parse(value))) {
        return 'date_string';
      }
      
      return 'text';
    }
    
    return 'unknown';
  }

  /**
   * Validation rapide d'un fichier Excel
   */
  async quickValidate(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Vérifier l'extension
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      errors.push('Format de fichier non supporté. Utilisez .xlsx ou .xls');
    }

    // Vérifier la taille (limite par défaut: 50MB)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('Fichier trop volumineux (maximum 50MB)');
    }

    // Vérifier que le fichier n'est pas vide
    if (file.size === 0) {
      errors.push('Le fichier est vide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exporte les données nettoyées vers un nouveau fichier Excel
   */
  async exportCleanedData(previewData: ExcelPreviewData, config?: ExcelImportConfig): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();

    previewData.sheets.forEach(sheet => {
      if (!sheet.hasData) return;

      const worksheet = workbook.addWorksheet(sheet.name);

      // Ajouter les en-têtes
      worksheet.addRow(sheet.headers);

      // Ajouter les données nettoyées
      sheet.data.forEach(row => {
        const cleanedRow = row.map(cell => {
          if (config?.trimWhitespace && typeof cell === 'string') {
            return cell.trim();
          }
          return cell;
        });
        worksheet.addRow(cleanedRow);
      });

      // Styliser les en-têtes
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Auto-ajuster la largeur des colonnes
      worksheet.columns.forEach(column => {
        if (column && column.eachCell) {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Génère un rapport d'analyse détaillé
   */
  generateAnalysisReport(previewData: ExcelPreviewData, statistics: ExcelDataStatistics): string {
    const report = [];
    
    report.push('=== RAPPORT D\'ANALYSE EXCEL ===');
    report.push(`Fichier: ${previewData.fileName}`);
    report.push(`Taille: ${(previewData.fileSize / 1024).toFixed(2)} KB`);
    report.push(`Nombre de feuilles: ${previewData.sheets.length}`);
    report.push(`Total lignes: ${previewData.totalRows}`);
    report.push('');

    // Informations sur les feuilles
    report.push('=== FEUILLES ===');
    previewData.sheets.forEach(sheet => {
      report.push(`${sheet.name}: ${sheet.rowCount} lignes, ${sheet.columnCount} colonnes`);
      
      if (sheet.duplicateRows && sheet.duplicateRows.length > 0) {
        report.push(`  Lignes dupliquées: ${sheet.duplicateRows.length}`);
      }
      
      if (sheet.emptyRows && sheet.emptyRows.length > 0) {
        report.push(`  Lignes vides: ${sheet.emptyRows.length}`);
      }
    });
    report.push('');

    // Erreurs
    if (previewData.errors.length > 0) {
      report.push('=== ERREURS ===');
      previewData.errors.forEach(error => {
        report.push(`${error.message} (${error.sheet})`);
        if (error.suggestion) {
          report.push(`  Suggestion: ${error.suggestion}`);
        }
      });
      report.push('');
    }

    // Avertissements
    if (previewData.warnings.length > 0) {
      report.push('=== AVERTISSEMENTS ===');
      previewData.warnings.forEach(warning => {
        report.push(`${warning.message} (${warning.sheet})`);
        if (warning.suggestion) {
          report.push(`  Suggestion: ${warning.suggestion}`);
        }
      });
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Configurations prédéfinies pour différents types d'import
   */
  getQuestionImportConfig(): ExcelImportConfig {
    return {
      expectedHeaders: ['Enonce', 'Type', 'Options'],
      requiredColumns: ['Enonce', 'Type'],
      maxRows: 1000,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedSheets: ['Questions', 'Sheet1', 'Feuil1']
    };
  }

  getUserImportConfig(): ExcelImportConfig {
    return {
      expectedHeaders: ['Nom', 'Prenom', 'Email', 'Type'],
      requiredColumns: ['Nom', 'Prenom', 'Email'],
      maxRows: 5000,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedSheets: ['Utilisateurs', 'Users', 'Sheet1', 'Feuil1']
    };
  }

  getStudentImportConfig(): ExcelImportConfig {
    return {
      expectedHeaders: ['Nom', 'Prenom', 'Email', 'Matricule', 'Classe'],
      requiredColumns: ['Nom', 'Prenom', 'Email', 'Matricule'],
      maxRows: 2000,
      maxFileSize: 8 * 1024 * 1024, // 8MB
      allowedSheets: ['Etudiants', 'Students', 'Sheet1', 'Feuil1']
    };
  }
}