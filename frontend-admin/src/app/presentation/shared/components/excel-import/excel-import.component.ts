import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportService, ImportResult, ImportPreview } from '../../../../core/services/import.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ImportConfig {
  type: 'cours' | 'classes' | 'etudiants' | 'enseignants' | 'administrateurs';
  title: string;
  description: string;
  templateColumns: { header: string; key: string; width: number; required?: boolean }[];
  exampleData: any[];
  instructions: string[];
}

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent {
  @Input() config!: ImportConfig;
  @Output() imported = new EventEmitter<ImportResult>();
  @Output() cancelled = new EventEmitter<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  selectedFile = signal<File | null>(null);
  previewData = signal<ImportPreview | null>(null);
  showPreview = signal(false);

  constructor(private importService: ImportService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.errorMessage.set('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set('Le fichier est trop volumineux (max 10MB)');
        return;
      }

      this.selectedFile.set(file);
      this.errorMessage.set('');
    }
  }

  async downloadTemplate(): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(this.config.title);

      // Définir les colonnes
      worksheet.columns = this.config.templateColumns;

      // Styliser l'en-tête
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 25;

      // Ajouter des exemples
      this.config.exampleData.forEach(example => {
        worksheet.addRow(example);
      });

      // Ajouter des bordures
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Ajouter une feuille d'instructions
      const instructionsSheet = workbook.addWorksheet('Instructions');
      instructionsSheet.columns = [
        { header: 'Guide d\'utilisation', key: 'guide', width: 80 }
      ];

      instructionsSheet.getRow(1).font = { bold: true, size: 14 };
      instructionsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667EEA' }
      };
      instructionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      const allInstructions = [
        '',
        `📋 IMPORT ${this.config.title.toUpperCase()}`,
        '',
        this.config.description,
        '',
        '📝 COLONNES REQUISES',
        '',
        ...this.config.templateColumns
          .filter(col => col.required !== false)
          .map(col => `• ${col.header} (obligatoire)`),
        '',
        '📝 COLONNES OPTIONNELLES',
        '',
        ...this.config.templateColumns
          .filter(col => col.required === false)
          .map(col => `• ${col.header} (optionnel)`),
        '',
        '⚠️ RÈGLES IMPORTANTES',
        '',
        ...this.config.instructions,
        '',
        '✅ EXEMPLES',
        '',
        `Voir la feuille "${this.config.title}" pour des exemples concrets`,
        '',
        '🚀 UTILISATION',
        '',
        `1. Remplissez la feuille "${this.config.title}" avec vos données`,
        '2. Supprimez les exemples fournis',
        '3. Enregistrez le fichier',
        '4. Importez-le dans l\'application',
        '',
        '💡 CONSEILS',
        '',
        '- Testez d\'abord avec quelques lignes',
        '- Vérifiez l\'orthographe avant d\'importer',
        '- Gardez une copie de sauvegarde',
        ''
      ];

      allInstructions.forEach((text, index) => {
        const row = instructionsSheet.addRow({ guide: text });
        if (text.startsWith('📋') || text.startsWith('📝') || text.startsWith('⚠️') || text.startsWith('✅') || text.startsWith('🚀') || text.startsWith('💡')) {
          row.font = { bold: true, size: 12, color: { argb: 'FF667EEA' } };
        }
        row.alignment = { vertical: 'top', wrapText: true };
      });

      // Générer le fichier
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, `modele-${this.config.type}.xlsx`);

      console.log(`✅ Template ${this.config.type} téléchargé`);
    } catch (error) {
      console.error('❌ Erreur lors de la génération du template:', error);
      this.errorMessage.set('Erreur lors de la génération du template');
    }
  }

  async validateAndPreview(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Veuillez sélectionner un fichier');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      this.importService.previewImport(file, this.config.type).subscribe({
        next: (preview) => {
          this.previewData.set(preview);
          this.showPreview.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la prévisualisation:', error);
          this.errorMessage.set(error.error?.message || 'Erreur lors de la prévisualisation');
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la prévisualisation:', error);
      this.errorMessage.set('Erreur lors de la lecture du fichier');
      this.isLoading.set(false);
    }
  }

  confirmImport(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Aucun fichier sélectionné');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Appeler la méthode d'import appropriée selon le type
    let importObservable;
    switch (this.config.type) {
      case 'cours':
        importObservable = this.importService.importCours(file);
        break;
      case 'classes':
        importObservable = this.importService.importClasses(file);
        break;
      case 'etudiants':
        importObservable = this.importService.importEtudiants(file);
        break;
      case 'enseignants':
        importObservable = this.importService.importEnseignants(file);
        break;
      case 'administrateurs':
        importObservable = this.importService.importAdministrateurs(file);
        break;
      default:
        this.errorMessage.set('Type d\'import non supporté');
        this.isLoading.set(false);
        return;
    }

    importObservable.subscribe({
      next: (result) => {
        console.log(`✅ ${this.config.type} importés:`, result);
        this.isLoading.set(false);
        this.imported.emit(result);
      },
      error: (error) => {
        console.error(`❌ Erreur lors de l'import ${this.config.type}:`, error);
        const errorMsg = error.error?.message || error.message || 'Erreur lors de l\'import';
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  resetImport(): void {
    this.selectedFile.set(null);
    this.previewData.set(null);
    this.showPreview.set(false);
    this.errorMessage.set('');
  }
}