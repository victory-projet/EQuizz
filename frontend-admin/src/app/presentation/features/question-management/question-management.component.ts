import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { QuestionImportComponent } from '../question-import/question-import.component';
import { Question } from '../../../core/domain/entities/question.entity';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';

@Component({
  selector: 'app-question-management',
  standalone: true,
  imports: [CommonModule, QuestionFormComponent, QuestionImportComponent],
  templateUrl: './question-management.component.html',
  styleUrls: ['./question-management.component.scss']
})
export class QuestionManagementComponent implements OnInit {
  @Input() quizzId!: string | number;
  @Input() evaluationId!: string | number;

  questions = signal<Question[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // États d'affichage
  showCreateForm = signal(false);
  showImportForm = signal(false);
  editingQuestionId = signal<string | number | null>(null);

  constructor(private evaluationUseCase: EvaluationUseCase) {}

  ngOnInit(): void {
    console.log('🚀 QuestionManagement - ngOnInit avec:', {
      quizzId: this.quizzId,
      evaluationId: this.evaluationId
    });
    this.loadQuestions();
  }

  loadQuestions(): void {
    console.log('🔍 QuestionManagement - loadQuestions appelée avec quizzId:', this.quizzId);
    
    if (!this.quizzId) {
      console.log('❌ QuestionManagement - Pas de quizzId fourni');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');

    console.log('📡 QuestionManagement - Appel API getQuestionsByQuizz avec ID:', this.quizzId);
    
    this.evaluationUseCase.getQuestionsByQuizz(this.quizzId).subscribe({
      next: (questions: Question[]) => {
        console.log('✅ QuestionManagement - Questions reçues:', questions);
        this.questions.set(questions);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ QuestionManagement - Erreur lors du chargement des questions:', error);
        this.errorMessage.set('Erreur lors du chargement des questions');
        this.isLoading.set(false);
      }
    });
  }

  onShowCreateForm(): void {
    this.showCreateForm.set(true);
    this.showImportForm.set(false);
  }

  onShowImportForm(): void {
    this.showImportForm.set(true);
    this.showCreateForm.set(false);
  }

  onQuestionCreated(question: Question): void {
    this.evaluationUseCase.createQuestion(this.quizzId, question).subscribe({
      next: (createdQuestion: Question) => {
        // Ajouter la nouvelle question à la liste
        const currentQuestions = this.questions();
        this.questions.set([...currentQuestions, createdQuestion]);
        
        // Masquer le formulaire et afficher un message de succès
        this.showCreateForm.set(false);
        this.showSuccessMessage('Question créée avec succès !');
        
        console.log('✅ Question créée avec succès:', createdQuestion);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la création de la question:', error);
        this.errorMessage.set('Erreur lors de la création de la question');
      }
    });
  }

  onQuestionsImported(_importedQuestions: Question[]): void {
    // Recharger toutes les questions après l'import
    this.loadQuestions();
    this.showImportForm.set(false);
    this.showSuccessMessage('Questions importées avec succès !');
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.showImportForm.set(false);
  }

  onDeleteQuestion(questionId: string | number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.evaluationUseCase.deleteQuestion(questionId.toString()).subscribe({
        next: () => {
          // Retirer la question de la liste
          const currentQuestions = this.questions();
          this.questions.set(currentQuestions.filter(q => q.id !== questionId));
          this.showSuccessMessage('Question supprimée avec succès !');
          console.log('✅ Question supprimée avec succès');
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.errorMessage.set('Erreur lors de la suppression de la question');
        }
      });
    }
  }

  onEditQuestion(question: Question): void {
    // TODO: Implémenter l'édition de question
    // Pour l'instant, on peut dupliquer la logique du formulaire de création
    console.log('Édition de la question:', question);
    // Ici on pourrait ouvrir un modal ou naviguer vers un formulaire d'édition
  }

  onDuplicateQuestion(question: Question): void {
    if (confirm('Voulez-vous dupliquer cette question ?')) {
      // Créer une copie de la question sans l'ID
      const duplicatedQuestion: Partial<Question> = {
        enonce: `${question.enonce} (copie)`,
        typeQuestion: question.typeQuestion,
        options: question.options ? [...question.options] : undefined
      };

      this.evaluationUseCase.createQuestion(this.quizzId, duplicatedQuestion).subscribe({
        next: (createdQuestion: Question) => {
          // Ajouter la nouvelle question à la liste
          const currentQuestions = this.questions();
          this.questions.set([...currentQuestions, createdQuestion]);
          this.showSuccessMessage('Question dupliquée avec succès !');
          console.log('✅ Question dupliquée avec succès:', createdQuestion);
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la duplication:', error);
          this.errorMessage.set('Erreur lors de la duplication de la question');
        }
      });
    }
  }

  getQuestionTypeLabel(type: string | undefined): string {
    if (!type) return 'Type inconnu';
    const labels: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'Choix multiples',
      'REPONSE_OUVERTE': 'Réponse ouverte'
    };
    return labels[type] || type;
  }

  getQuestionTypeIcon(type: string | undefined): string {
    if (!type) return 'help_outline';
    const icons: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'checklist',
      'REPONSE_OUVERTE': 'edit_note'
    };
    return icons[type] || 'help_outline';
  }

  // Méthode pour accéder à String dans le template
  getCharFromIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Vérifier si une question a des options valides
  hasValidOptions(question: Question): boolean {
    return question.options !== undefined && Array.isArray(question.options) && question.options.length > 0;
  }

  // Obtenir le nombre d'options pour une question
  getOptionsCount(question: Question): number {
    if (!question.options || !Array.isArray(question.options)) {
      return 0;
    }
    return question.options.length;
  }

  // Obtenir une description du type de question
  getQuestionTypeDescription(type: string | undefined): string {
    if (!type) return 'Type non défini';
    const descriptions: { [key: string]: string } = {
      'QCM': 'Les étudiants doivent choisir parmi plusieurs options proposées',
      'TEXTE_LIBRE': 'Les étudiants peuvent répondre librement par du texte',
      'VRAI_FAUX': 'Les étudiants doivent choisir entre Vrai ou Faux',
      'NUMERIQUE': 'Les étudiants doivent saisir une valeur numérique',
      'OUI_NON': 'Les étudiants doivent choisir entre Oui ou Non',
      'ECHELLE': 'Les étudiants doivent évaluer sur une échelle'
    };
    return descriptions[type] || 'Type de question non reconnu';
  }

  // Nouvelles méthodes pour les statistiques
  getMultipleChoiceCount(): number {
    return this.questions().filter(q => q.typeQuestion === 'QCM').length;
  }

  getOpenResponseCount(): number {
    return this.questions().filter(q => q.typeQuestion === 'TEXTE_LIBRE').length;
  }

  // Méthode pour afficher un message de succès temporaire
  private showSuccessMessage(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set('');
    }, 5000); // Masquer après 5 secondes
  }

  // Méthode pour masquer les messages
  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}