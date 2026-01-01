import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationService, Submission } from '../../../core/services/evaluation.service';

@Component({
  selector: 'app-evaluation-submissions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="submissions-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Soumissions de l'évaluation</h1>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Chargement des soumissions...</p>
        </div>
      } @else if (errorMessage()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <p>{{ errorMessage() }}</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="stats-cards">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>people</mat-icon>
                <div>
                  <h3>{{ submissions().length }}</h3>
                  <p>Total étudiants</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <h3>{{ getCompletedCount() }}</h3>
                  <p>Terminées</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon>schedule</mat-icon>
                <div>
                  <h3>{{ getInProgressCount() }}</h3>
                  <p>En cours</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="submissions-table-card">
          <mat-card-header>
            <mat-card-title>Liste des soumissions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="submissions()" class="submissions-table">
                <ng-container matColumnDef="etudiant">
                  <th mat-header-cell *matHeaderCellDef>Étudiant</th>
                  <td mat-cell *matCellDef="let submission">
                    <div class="student-info">
                      <strong>{{ submission.etudiant.prenom }} {{ submission.etudiant.nom }}</strong>
                      <small>{{ submission.etudiant.classe || 'Non assigné' }}</small>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let submission">
                    <mat-chip [class]="getStatusClass(submission.estTermine)">
                      <mat-icon>{{ submission.estTermine ? 'check_circle' : 'schedule' }}</mat-icon>
                      {{ submission.estTermine ? 'Terminée' : 'En cours' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="dateDebut">
                  <th mat-header-cell *matHeaderCellDef>Date de début</th>
                  <td mat-cell *matCellDef="let submission">
                    {{ formatDate(submission.dateDebut) }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="dateFin">
                  <th mat-header-cell *matHeaderCellDef>Date de fin</th>
                  <td mat-cell *matCellDef="let submission">
                    {{ submission.dateFin ? formatDate(submission.dateFin) : '-' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="reponses">
                  <th mat-header-cell *matHeaderCellDef>Réponses</th>
                  <td mat-cell *matCellDef="let submission">
                    {{ submission.reponses.length }} réponse(s)
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let submission">
                    <button mat-icon-button (click)="viewSubmissionDetails(submission)" 
                            matTooltip="Voir les détails">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styleUrls: ['./evaluation-submissions.component.scss']
})
export class EvaluationSubmissionsComponent implements OnInit {
  submissions = signal<Submission[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  evaluationId: string = '';

  displayedColumns: string[] = ['etudiant', 'status', 'dateDebut', 'dateFin', 'reponses', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.evaluationId = this.route.snapshot.params['id'];
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationService.getSubmissions(this.evaluationId).subscribe({
      next: (submissions) => {
        this.submissions.set(submissions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des soumissions:', error);
        this.errorMessage.set('Erreur lors du chargement des soumissions');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/evaluations']);
  }

  getCompletedCount(): number {
    return this.submissions().filter(s => s.estTermine).length;
  }

  getInProgressCount(): number {
    return this.submissions().filter(s => !s.estTermine).length;
  }

  getStatusClass(isCompleted: boolean): string {
    return isCompleted ? 'status-completed' : 'status-in-progress';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewSubmissionDetails(submission: Submission): void {
    // TODO: Implémenter la vue détaillée d'une soumission
    console.log('Voir détails de la soumission:', submission);
  }
}