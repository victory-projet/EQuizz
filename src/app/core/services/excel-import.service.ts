import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

export interface ExcelQuestion {
  type: string;
  question: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  isValid: boolean;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  
  /**
   * Parse un fichier Excel et retourne les questions
   */
  parseExcelFile(file: File): Observable<ExcelQuestion[]> {
    return from(this.readExcelFile(file));
  }

  /**
   * Lit le fichier Excel et extrait les données
   */
  private async readExcelFile(file: File): Promise<ExcelQuestion[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        try {
          // Pour l'instant, simulation de données
          // En production, utilisez la bibliothèque 'xlsx' pour parser le fichier
          const questions = this.simulateExcelParsing();
          resolve(questions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Simulation du parsing Excel (à remplacer par la vraie logique avec xlsx)
   */
  private simulateExcelParsing(): ExcelQuestion[] {
    return [
      {
        type: 'multiple',
        question: 'Quelle est la complexité de l\'algorithme de tri rapide?',
        option1: 'O(n log n)',
        option2: 'O(n²)',
        option3: 'O(log n)',
        option4: 'O(1)',
        isValid: true
      },
      {
        type: 'close',
        question: 'La Terre est plate',
        option1: 'Vrai',
        option2: 'Faux',
        isValid: true
      },
      {
        type: 'multiple',
        question: 'Quel langage est utilisé pour le développement web côté client?',
        option1: 'JavaScript',
        option2: 'Python',
        option3: 'Java',
        option4: 'C++',
        isValid: true
      },
      {
        type: 'open',
        question: 'Expliquez le concept de polymorphisme en programmation orientée objet',
        isValid: true
      },
      {
        type: 'multiple',
        question: '',
        option1: 'Option 1',
        option2: 'Option 2',
        isValid: false,
        errorMessage: 'Question vide'
      }
    ];
  }

  /**
   * Valide une question importée
   */
  validateQuestion(question: ExcelQuestion): boolean {
    // Vérifier que le type est valide
    const validTypes = ['multiple', 'close', 'open'];
    if (!validTypes.includes(question.type.toLowerCase())) {
      question.errorMessage = 'Type de question invalide';
      return false;
    }

    // Vérifier que la question n'est pas vide
    if (!question.question || question.question.trim() === '') {
      question.errorMessage = 'Question vide';
      return false;
    }

    // Pour les questions à choix multiple, vérifier qu'il y a au moins 2 options
    if (question.type === 'multiple') {
      const optionsCount = [question.option1, question.option2, question.option3, question.option4]
        .filter(opt => opt && opt.trim() !== '').length;
      
      if (optionsCount < 2) {
        question.errorMessage = 'Au moins 2 options requises pour un QCM';
        return false;
      }
    }

    return true;
  }

  /**
   * Génère un fichier Excel template pour l'import
   */
  generateTemplate(): void {
    // Créer un template Excel avec les colonnes appropriées
    const templateData = [
      ['Type', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4'],
      ['multiple', 'Quelle est la capitale de la France?', 'Paris', 'Londres', 'Berlin', 'Madrid'],
      ['close', 'La Terre est ronde', 'Vrai', 'Faux', '', ''],
      ['open', 'Expliquez le concept de polymorphisme', '', '', '', '']
    ];

    // En production, utilisez la bibliothèque 'xlsx' pour générer le fichier
    console.log('Template Excel généré:', templateData);
    
    // Simulation du téléchargement
    alert('Le template Excel sera téléchargé. Fonctionnalité à implémenter avec la bibliothèque xlsx.');
  }

  /**
   * Convertit les questions Excel en format Question de l'application
   */
  convertToAppFormat(excelQuestions: ExcelQuestion[]): any[] {
    return excelQuestions
      .filter(q => q.isValid)
      .map((q, index) => ({
        id: `imported-${Date.now()}-${index}`,
        type: q.type,
        text: q.question,
        order: index + 1,
        points: 1,
        options: this.buildOptions(q),
        createdAt: new Date()
      }));
  }

  /**
   * Construit les options pour une question
   */
  private buildOptions(question: ExcelQuestion): any[] {
    if (question.type !== 'multiple' && question.type !== 'close') {
      return [];
    }

    const options = [
      question.option1,
      question.option2,
      question.option3,
      question.option4
    ].filter(opt => opt && opt.trim() !== '');

    return options.map((opt, index) => ({
      id: `opt-${Date.now()}-${index}`,
      text: opt,
      order: index + 1
    }));
  }
}
