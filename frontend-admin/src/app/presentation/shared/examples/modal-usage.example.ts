// src/app/shared/examples/modal-usage.example.ts
// Exemple d'utilisation des modals et de la gestion des erreurs

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';
import { LoadingComponent } from '../components/loading/loading.component';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorHandlerService, AppError } from '../../../core/services/error-handler.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-modal-usage-example',
  standalone: true,
  imports: [
    CommonModule,
    ErrorModalComponent,
    ConfirmationModalComponent,
    LoadingComponent
  ],
  template: `
    <div class="example-container">
      <h2>Exemples d'utilisation des Modals</h2>

      <!-- Boutons de démonstration -->
      <div class="button-group">
        <button (click)="showSuccessToast()">Toast Success</button>
        <button (click)="showErrorToast()">Toast Error</button>
        <button (click)="showWarningToast()">Toast Warning</button>
        <button (click)="showInfoToast()">Toast Info</button>
        <button (click)="showErrorModal()">Error Modal</button>
        <button (click)="showConfirmation()">Confirmation Modal</button>
        <button (click)="simulateApiError()">Simuler Erreur API</button>
      </div>

      <!-- Loading -->
      <app-loading 
        *ngIf="isLoading"
        [overlay]="true"
        message="Chargement en cours...">
      </app-loading>

      <!-- Error Modal -->
      <app-error-modal
        [isOpen]="showError"
        [error]="currentError"
        title="Une erreur est survenue"
        (close)="closeErrorModal()">
      </app-error-modal>

      <!-- Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="showConfirm"
        [data]="confirmationData"
        (confirm)="onConfirm()"
        (cancel)="onCancel()">
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 24px;
    }

    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    button {
      padding: 10px 20px;
      background: #3a5689;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    button:hover {
      background: #2d4470;
      transform: translateY(-1px);
    }
  `]
})
export class ModalUsageExampleComponent {
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);

  isLoading = false;
  showError = false;
  showConfirm = false;
  currentError: AppError | null = null;
  confirmationData = {
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    entityName: 'Quiz "Introduction à Angular"',
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    isDangerous: true
  };

  // Toast Examples
  showSuccessToast(): void {
    this.toastService.success('Opération réussie !');
  }

  showErrorToast(): void {
    this.toastService.error('Une erreur est survenue lors de l\'opération');
  }

  showWarningToast(): void {
    this.toastService.warning('Attention : cette action est irréversible');
  }

  showInfoToast(): void {
    this.toastService.info('Nouvelle mise à jour disponible');
  }

  // Error Modal Example
  showErrorModal(): void {
    this.currentError = {
      message: 'Impossible de se connecter au serveur',
      code: 'NETWORK_ERROR',
      status: 0,
      details: {
        url: '/api/quizzes',
        method: 'GET',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };
    this.showError = true;
  }

  closeErrorModal(): void {
    this.showError = false;
    this.currentError = null;
  }

  // Confirmation Modal Example
  showConfirmation(): void {
    this.showConfirm = true;
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.toastService.success('Élément supprimé avec succès');
  }

  onCancel(): void {
    this.showConfirm = false;
    this.toastService.info('Action annulée');
  }

  // Simulate API Error
  simulateApiError(): void {
    this.isLoading = true;

    // Simuler un appel API qui échoue
    setTimeout(() => {
      const error = new Error('Erreur serveur');
      this.errorHandler.handleError(error)
        .pipe(
          catchError((err: AppError) => {
            this.currentError = err;
            this.showError = true;
            this.isLoading = false;
            throw err;
          })
        )
        .subscribe();
    }, 2000);
  }
}
