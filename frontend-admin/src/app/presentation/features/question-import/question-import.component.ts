import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Question } from '../../../core/domain/entities/evaluation.entity';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-question-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-import.component.html',
  styleUrls: ['./question-import.component.scss']
})
export class QuestionImportComponent {
  @Input() evaluationId!: string | number;
  @Input() quizzId!: string | number;
  
  @Output() imported = new EventEmitter<Question[]>();
  @Output() cancelled = new EventEmitter<void>();

  isLoading = signal(false);
  errorMessage = signal('');
  selectedFile = signal<File | null>(null);
  previewQuestions = signal<any[]>([]);
  showPreview = signal(false);

  constructor(private evaluationUseCase: EvaluationUseCase) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.errorMessage.set('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      this.selectedFile.set(file);
      this.errorMessage.set('');
    }
  }

  async downloadTemplate(): Promise<void> {
    try {
      // Créer un nouveau workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Questions');

      // Définir les colonnes
      worksheet.columns = [
        { header: 'Enonce', key: 'enonce', width: 50 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Options', key: 'options', width: 60 }
      ];

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
      worksheet.addRow({
        enonce: 'Quelle est la capitale de la France ?',
        type: 'CHOIX_MULTIPLE',
        options: 'Paris;Londres;Berlin;Madrid'
      });

      worksheet.addRow({
        enonce: 'Qu\'est-ce que le polymorphisme en POO ?',
        type: 'CHOIX_MULTIPLE',
        options: 'Héritage multiple;Capacité d\'un objet à prendre plusieurs formes;Encapsulation;Abstraction'
      });

      worksheet.addRow({
        enonce: 'Expliquez le concept de récursivité en programmation',
        type: 'REPONSE_OUVERTE',
        options: ''
      });

      worksheet.addRow({
        enonce: 'Décrivez les avantages du cloud computing',
        type: 'REPONSE_OUVERTE',
        options: ''
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

      const instructions = [
        '',
        '📋 FORMAT DU FICHIER',
        '',
        'Le fichier doit contenir 3 colonnes :',
        '1. Enonce : Le texte de la question (obligatoire)',
        '2. Type : Le type de question (obligatoire)',
        '3. Options : Les options de réponse pour les QCM (obligatoire pour CHOIX_MULTIPLE)',
        '',
        '📝 TYPES DE QUESTIONS',
        '',
        'CHOIX_MULTIPLE : Question à choix multiples (QCM)',
        '  - Nécessite des options séparées par des points-virgules (;)',
        '  - Exemple : Paris;Londres;Berlin;Madrid',
        '',
        'REPONSE_OUVERTE : Question à réponse libre',
        '  - Laissez la colonne Options vide',
        '',
        '⚠️ RÈGLES IMPORTANTES',
        '',
        '1. Ne supprimez pas la ligne d\'en-tête (Enonce, Type, Options)',
        '2. Le type doit être exactement CHOIX_MULTIPLE ou REPONSE_OUVERTE (en majuscules)',
        '3. Pour les QCM, séparez les options par des points-virgules (;)',
        '4. Minimum 2 options pour les questions CHOIX_MULTIPLE',
        '5. Supprimez les lignes d\'exemple avant d\'importer',
        '',
        '✅ EXEMPLES',
        '',
        'Voir la feuille "Questions" pour des exemples concrets',
        '',
        '🚀 UTILISATION',
        '',
        '1. Remplissez la feuille "Questions" avec vos questions',
        '2. Supprimez les exemples fournis',
        '3. Enregistrez le fichier',
        '4. Importez-le dans l\'application',
        '',
        '💡 CONSEILS',
        '',
        '- Testez d\'abord avec quelques questions',
        '- Vérifiez l\'orthographe avant d\'importer',
        '- Gardez une copie de sauvegarde',
        ''
      ];

      instructions.forEach((text, index) => {
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
      saveAs(blob, 'modele-questions.xlsx');

      console.log('✅ Template Excel téléchargé');
    } catch (error) {
      console.error('❌ Erreur lors de la génération du template:', error);
      this.errorMessage.set('Erreur lors de la génération du template');
    }
  }

  validateAndPreview(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Veuillez sélectionner un fichier');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // For now, we'll just show a preview message
    // In a real implementation, you would parse the Excel file here
    setTimeout(() => {
      this.previewQuestions.set([
        { enonce: 'Question 1 importée', type: 'QCM', options: ['Option A', 'Option B'] },
        { enonce: 'Question 2 importée', type: 'TEXTE_LIBRE' }
      ]);
      this.showPreview.set(true);
      this.isLoading.set(false);
    }, 1000);
  }

  confirmImport(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Aucun fichier sélectionné');
      return;
    }

    console.log('📤 Importing questions:', {
      quizzId: this.quizzId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.importQuestions(this.quizzId, file).subscribe({
      next: (response: any) => {
        console.log('✅ Questions imported:', response);
        this.isLoading.set(false);
        // Le backend retourne { count, questions }
        const questions = response.questions || response;
        this.imported.emit(questions);
      },
      error: (error) => {
        console.error('❌ Error importing questions:', error);
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
    this.previewQuestions.set([]);
    this.showPreview.set(false);
    this.errorMessage.set('');
  }
}
