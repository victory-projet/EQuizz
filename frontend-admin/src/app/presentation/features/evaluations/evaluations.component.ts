import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {
  evaluations = signal<Evaluation[]>([]);
  filteredEvaluations = signal<Evaluation[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<string>('ALL');
  
  // Stats
  totalQuiz = signal(0);
  activeQuiz = signal(0);
  draftQuiz = signal(0);
  closedQuiz = signal(0);

  errorMessage = signal('');
  successMessage = signal('');
  showCardMenu = signal<number | string | null>(null);
  showDuplicateMenuId = signal<number | string | null>(null);

  private confirmationService = inject(ConfirmationService);

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.isLoading.set(true);
    console.log('📥 Chargement des évaluations...');
    this.evaluationUseCase.getEvaluations().subscribe({
      next: (evaluations) => {
        console.log('✅ Évaluations reçues:', evaluations);
        // Log détaillé de la première évaluation pour debug
        if (evaluations.length > 0) {
          console.log('🔍 Détail première évaluation:', JSON.stringify(evaluations[0], null, 2));
        }
        this.evaluations.set(evaluations);
        this.updateStats();
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des évaluations:', error);
        this.errorMessage.set('Erreur lors du chargement des évaluations');
        this.isLoading.set(false);
      }
    });
  }

  updateStats(): void {
    const evals = this.evaluations();
    this.totalQuiz.set(evals.length);
    this.activeQuiz.set(evals.filter(e => e.statut === 'PUBLIEE').length);
    this.draftQuiz.set(evals.filter(e => e.statut === 'BROUILLON').length);
    this.closedQuiz.set(evals.filter(e => e.statut === 'CLOTUREE').length);
  }

  applyFilters(): void {
    let filtered = this.evaluations();
    
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(e => e.statut === this.filterStatus());
    }
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }
    
    this.filteredEvaluations.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  createEvaluation(): void {
    this.router.navigate(['/evaluations/create']);
  }

  viewEvaluation(id: number | string): void {
    this.router.navigate(['/evaluations', id]);
  }

  editEvaluation(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'edit']);
  }

  // Actions avec confirmation
  async publishEvaluation(evaluation: Evaluation): Promise<void> {
    console.log('🚀 Tentative de publication de l\'évaluation:', evaluation.id, evaluation.titre);
    console.log('📊 Nombre de questions:', this.getQuestionCount(evaluation));
    
    const confirmed = await this.confirmationService.confirmPublish(evaluation.titre);
    if (!confirmed) {
      console.log('❌ Publication annulée par l\'utilisateur');
      return;
    }

    this.isLoading.set(true);
    console.log('📡 Envoi de la requête de publication...');
    
    this.evaluationUseCase.publishEvaluation(evaluation.id as any).subscribe({
      next: (result) => {
        console.log('✅ Publication réussie:', result);
        this.successMessage.set('Évaluation publiée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la publication:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error details:', error.error);
        
        let errorMsg = 'Erreur lors de la publication';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 400) {
          errorMsg = 'Impossible de publier cette évaluation. Vérifiez qu\'elle contient au moins une question.';
        } else if (error.status === 404) {
          errorMsg = 'Évaluation non trouvée.';
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  async closeEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmClose(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.closeEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation clôturée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la clôture');
        this.isLoading.set(false);
      }
    });
  }

  async debugDelete(evaluation: Evaluation): Promise<void> {
    console.log('🔍 Debug - Test de suppression pour:', evaluation.id, evaluation.titre);
    
    this.evaluationUseCase.debugDelete(evaluation.id as any).subscribe({
      next: (debugInfo) => {
        console.log('🔍 Debug - Informations de suppression:', debugInfo);
        
        let message = `Debug pour "${evaluation.titre}":\n`;
        message += `- ID: ${debugInfo.evaluation.id}\n`;
        message += `- Statut: ${debugInfo.evaluation.statut}\n`;
        message += `- A un quizz: ${debugInfo.evaluation.hasQuizz ? 'Oui' : 'Non'}\n`;
        message += `- Nombre de questions: ${debugInfo.evaluation.questionsCount}\n`;
        message += `- Soumissions: ${debugInfo.submissionsCount}\n`;
        message += `- Peut être supprimé: ${debugInfo.canDelete ? 'Oui' : 'Non'}\n`;
        message += `- Message: ${debugInfo.message}`;
        
        alert(message);
      },
      error: (error) => {
        console.error('❌ Debug - Erreur:', error);
        alert(`Erreur de debug: ${error.error?.message || error.message}`);
      }
    });
  }

  async deleteEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(evaluation.titre);
    if (!confirmed) return;

    console.log('🗑️ Tentative de suppression de l\'évaluation:', evaluation.id, evaluation.titre);
    this.isLoading.set(true);
    
    this.evaluationUseCase.deleteEvaluation(evaluation.id as any).subscribe({
      next: (response) => {
        console.log('✅ Suppression réussie:', response);
        this.successMessage.set('Évaluation supprimée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur suppression complète:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error object:', error.error);
        console.error('❌ Message:', error.message);
        
        let errorMsg = 'Erreur lors de la suppression';
        
        // Gestion des erreurs spécifiques
        if (error.status === 404) {
          errorMsg = 'Cette évaluation n\'existe plus ou a déjà été supprimée.';
        } else if (error.status === 400) {
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.error?.code === 'HAS_SUBMISSIONS') {
            errorMsg = 'Impossible de supprimer une évaluation qui a des soumissions d\'étudiants.';
          }
        } else if (error.status === 403) {
          errorMsg = 'Vous n\'avez pas les permissions pour supprimer cette évaluation.';
        } else if (error.status === 500) {
          errorMsg = 'Erreur serveur lors de la suppression. Veuillez réessayer.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  async duplicateEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmDuplicate(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.duplicateEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation dupliquée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur duplication:', error);
        let errorMsg = 'Erreur lors de la duplication';
        
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  // Nouvelles méthodes pour l'interface améliorée
  toggleCardMenu(evaluationId: number | string): void {
    if (this.showCardMenu() === evaluationId) {
      this.showCardMenu.set(null);
    } else {
      this.showCardMenu.set(evaluationId);
    }
  }

  hideCardMenu(): void {
    this.showCardMenu.set(null);
  }

<<<<<<< Updated upstream
  showDuplicateMenu(evaluationId: number | string): void {
    this.showDuplicateMenuId.set(evaluationId);
  }

  hideDuplicateMenu(): void {
    this.showDuplicateMenuId.set(null);
  }

  // Méthode unifiée pour voir les détails/résultats
  viewEvaluationDetails(evaluation: Evaluation): void {
    if (evaluation.statut === 'CLOTUREE') {
      // Pour les évaluations clôturées, aller vers la section Rapports
      this.router.navigate(['/rapports'], { 
        queryParams: { evaluationId: evaluation.id } 
      });
    } else if (evaluation.statut === 'PUBLIEE') {
      // Pour les évaluations en cours, voir les soumissions en temps réel
      this.router.navigate(['/evaluations', evaluation.id, 'submissions']);
    } else {
      // Pour les brouillons, éditer
      this.editEvaluation(evaluation);
    }
  }

  viewSubmissions(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'submissions']);
  }

=======
>>>>>>> Stashed changes
  viewResults(evaluation: Evaluation): void {
    // Rediriger vers la section Rapports au lieu de evaluation-results
    this.router.navigate(['/rapports'], { 
      queryParams: { evaluationId: evaluation.id } 
    });
  }

  exportResults(evaluation: Evaluation): void {
    // TODO: Implémenter l'export des résultats
    this.successMessage.set('Export des résultats en cours de développement...');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'badge-draft';
      case 'PUBLIEE': return 'badge-active';
      case 'CLOTUREE': return 'badge-closed';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'Brouillon';
      case 'PUBLIEE': return 'En cours';
      case 'CLOTUREE': return 'Clôturée';
      default: return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'edit_note';
      case 'PUBLIEE': return 'play_circle';
      case 'CLOTUREE': return 'lock';
      default: return 'help_outline';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Date non définie';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  }

  getQuestionCount(evaluation: Evaluation): number {
    const count = evaluation.quizz?.questions?.length || (evaluation as any).Quizz?.Questions?.length || 0;
    console.log('📊 Nombre de questions pour', evaluation.titre, ':', count);
    return count;
  }

  getCoursName(evaluation: Evaluation): string {
    // Le backend peut retourner 'Cour' (singulier), 'Cours' (pluriel) ou 'cours' (camelCase)
    const coursName = (evaluation as any).Cour?.nom || 
                     (evaluation as any).Cours?.nom || 
                     evaluation.cours?.nom || 
                     (evaluation as any).cours_nom ||
                     'Cours non défini';
    console.log('📚 Cours pour', evaluation.titre, ':', coursName);
    if (coursName === 'Cours non défini') {
      console.log('📚 Objet évaluation complet:', JSON.stringify(evaluation, null, 2));
    }
    return coursName;
  }

  getClassesCount(evaluation: Evaluation): number {
    const count = (evaluation as any).Classes?.length || (evaluation as any).classe ? 1 : 0;
    console.log('👥 Nombre de classes pour', evaluation.titre, ':', count);
    return count;
  }
}
