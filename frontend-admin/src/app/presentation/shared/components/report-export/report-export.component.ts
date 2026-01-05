import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../../../../core/services/evaluation.service';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeSentimentAnalysis: boolean;
  includeChartData: boolean;
  includeDetailedResponses: boolean;
  includeStatistics: boolean;
}

export interface AdvancedReport {
  evaluation: {
    id: string;
    titre: string;
    statut: string;
    cours: string;
    dateCreation: string;
    nombreQuestions: number;
  };
  statistics: {
    totalSubmissions: number;
    completedSubmissions: number;
    completionRate: number;
    avgCompletionTime: number;
    classeDistribution: { [key: string]: number };
  };
  sentimentAnalysis: any;
  questionAnalysis: Array<{
    id: string;
    enonce: string;
    type: string;
    responseCount: number;
    responseRate: number;
    responses: string[];
  }>;
  insights: Array<{
    type: string;
    level: string;
    message: string;
    recommendation: string;
  }>;
  generatedAt: string;
}

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <mat-card class="report-export-card">
      <mat-card-header>
        <mat-card-title class="title-with-icon">
          <mat-icon>assessment</mat-icon>
          Export de Rapport
        </mat-card-title>
        <mat-card-subtitle>
          Générez et exportez des rapports détaillés d'évaluation
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Options d'export -->
        <div class="export-options">
          <h4>Options d'Export</h4>
          
          <div class="format-selection">
            <mat-form-field appearance="outline">
              <mat-label>Format de fichier</mat-label>
              <mat-select [(value)]="exportOptions.format">
                <mat-option value="excel">
                  <mat-icon>table_chart</mat-icon>
                  Excel (.xlsx)
                </mat-option>
                <mat-option value="pdf">
                  <mat-icon>picture_as_pdf</mat-icon>
                  PDF
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="content-options">
            <h5>Contenu à inclure</h5>
            
            <mat-checkbox 
              [(ngModel)]="exportOptions.includeSentimentAnalysis"
              matTooltip="Inclut l'analyse automatique des sentiments des réponses textuelles">
              <mat-icon>psychology</mat-icon>
              Analyse des sentiments
            </mat-checkbox>

            <mat-checkbox 
              [(ngModel)]="exportOptions.includeChartData"
              matTooltip="Inclut les données formatées pour créer des graphiques">
              <mat-icon>bar_chart</mat-icon>
              Données graphiques
            </mat-checkbox>

            <mat-checkbox 
              [(ngModel)]="exportOptions.includeDetailedResponses"
              matTooltip="Inclut toutes les réponses détaillées des étudiants">
              <mat-icon>list_alt</mat-icon>
              Réponses détaillées
            </mat-checkbox>

            <mat-checkbox 
              [(ngModel)]="exportOptions.includeStatistics"
              matTooltip="Inclut les statistiques avancées et métriques">
              <mat-icon>analytics</mat-icon>
              Statistiques avancées
            </mat-checkbox>
          </div>
        </div>

        <!-- Aperçu du rapport avancé -->
        <div *ngIf="advancedReport" class="report-preview">
          <h4>Aperçu du Rapport</h4>
          
          <div class="preview-grid">
            <div class="preview-card">
              <mat-icon>school</mat-icon>
              <div class="preview-content">
                <span class="preview-label">Étudiants</span>
                <span class="preview-value">{{ advancedReport.statistics.totalSubmissions }}</span>
              </div>
            </div>

            <div class="preview-card">
              <mat-icon>check_circle</mat-icon>
              <div class="preview-content">
                <span class="preview-label">Taux de completion</span>
                <span class="preview-value">{{ advancedReport.statistics.completionRate }}%</span>
              </div>
            </div>

            <div class="preview-card">
              <mat-icon>timer</mat-icon>
              <div class="preview-content">
                <span class="preview-label">Temps moyen</span>
                <span class="preview-value">{{ advancedReport.statistics.avgCompletionTime }} min</span>
              </div>
            </div>

            <div class="preview-card">
              <mat-icon>psychology</mat-icon>
              <div class="preview-content">
                <span class="preview-label">Sentiment global</span>
                <span class="preview-value" [ngClass]="getSentimentClass(advancedReport.sentimentAnalysis?.globalSentiment)">
                  {{ getSentimentLabel(advancedReport.sentimentAnalysis?.globalSentiment) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Insights -->
          <div *ngIf="advancedReport.insights && advancedReport.insights.length > 0" class="insights-preview">
            <h5>Insights Automatiques</h5>
            <div class="insights-list">
              <div 
                *ngFor="let insight of advancedReport.insights.slice(0, 3)" 
                class="insight-item"
                [ngClass]="getInsightLevelClass(insight.level)">
                <mat-icon>{{ getInsightIcon(insight.level) }}</mat-icon>
                <div class="insight-content">
                  <span class="insight-message">{{ insight.message }}</span>
                  <span class="insight-recommendation">{{ insight.recommendation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Barre de progression -->
        <div *ngIf="exporting" class="export-progress">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>{{ exportStatus }}</p>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="generateAdvancedReport()"
            [disabled]="loading || exporting">
            <mat-icon>refresh</mat-icon>
            Actualiser l'aperçu
          </button>

          <button 
            mat-raised-button 
            color="accent" 
            (click)="exportReport()"
            [disabled]="!evaluationId || exporting">
            <mat-icon>download</mat-icon>
            Exporter {{ exportOptions.format.toUpperCase() }}
          </button>

          <button 
            mat-stroked-button 
            (click)="exportAdvancedReport()"
            [disabled]="!advancedReport || exporting"
            matTooltip="Exporte le rapport d'analyse complet en JSON">
            <mat-icon>code</mat-icon>
            Export JSON
          </button>
        </div>

        <!-- Messages d'erreur -->
        <div *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          <p>{{ error }}</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .report-export-card {
      margin: 16px 0;
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .export-options {
      margin-bottom: 24px;
    }

    .export-options h4,
    .report-preview h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .format-selection {
      margin-bottom: 24px;
    }

    .format-selection mat-form-field {
      width: 200px;
    }

    .content-options h5 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .content-options mat-checkbox {
      display: flex;
      align-items: center;
      margin: 8px 0;
      gap: 8px;
    }

    .content-options mat-checkbox mat-icon {
      margin-right: 8px;
      color: #666;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .preview-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .preview-card mat-icon {
      color: #2196f3;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
    }

    .preview-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .preview-value {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .preview-value.positive {
      color: #4caf50;
    }

    .preview-value.negative {
      color: #f44336;
    }

    .preview-value.neutral {
      color: #9e9e9e;
    }

    .insights-preview {
      margin-top: 24px;
    }

    .insights-preview h5 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .insight-item.success {
      background: #e8f5e8;
      border-left-color: #4caf50;
    }

    .insight-item.warning {
      background: #fff3e0;
      border-left-color: #ff9800;
    }

    .insight-item.error {
      background: #ffebee;
      border-left-color: #f44336;
    }

    .insight-item.info {
      background: #e3f2fd;
      border-left-color: #2196f3;
    }

    .insight-item mat-icon {
      margin-top: 2px;
    }

    .insight-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .insight-message {
      font-weight: 500;
      color: #333;
    }

    .insight-recommendation {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .export-progress {
      margin: 24px 0;
    }

    .export-progress p {
      text-align: center;
      margin-top: 8px;
      color: #666;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 24px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      border-radius: 4px;
      color: #c62828;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .preview-grid {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }

      .format-selection mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class ReportExportComponent implements OnInit {
  @Input() evaluationId!: string;

  exportOptions: ExportOptions = {
    format: 'excel',
    includeSentimentAnalysis: true,
    includeChartData: true,
    includeDetailedResponses: true,
    includeStatistics: true
  };

  advancedReport: AdvancedReport | null = null;
  loading = false;
  exporting = false;
  exportStatus = '';
  error: string | null = null;

  constructor(
    private evaluationService: EvaluationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.evaluationId) {
      this.generateAdvancedReport();
    }
  }

  async generateAdvancedReport() {
    if (!this.evaluationId) return;

    this.loading = true;
    this.error = null;

    try {
      this.advancedReport = await this.evaluationService.generateAdvancedReport(this.evaluationId);
    } catch (error: any) {
      this.error = error.message || 'Erreur lors de la génération du rapport';
      console.error('Erreur génération rapport:', error);
    } finally {
      this.loading = false;
    }
  }

  async exportReport() {
    if (!this.evaluationId) return;

    this.exporting = true;
    this.exportStatus = 'Préparation du rapport...';
    this.error = null;

    try {
      const queryParams = new URLSearchParams({
        format: this.exportOptions.format,
        includeSentimentAnalysis: this.exportOptions.includeSentimentAnalysis.toString(),
        includeChartData: this.exportOptions.includeChartData.toString()
      });

      this.exportStatus = 'Génération du fichier...';
      
      const blob = await this.evaluationService.exportReport(this.evaluationId, queryParams.toString());
      
      this.exportStatus = 'Téléchargement...';
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = this.exportOptions.format === 'pdf' ? 'pdf' : 'xlsx';
      const filename = `rapport_evaluation_${this.evaluationId}_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      link.download = filename;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Rapport exporté avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

    } catch (error: any) {
      this.error = error.message || 'Erreur lors de l\'export du rapport';
      console.error('Erreur export rapport:', error);
      
      this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.exporting = false;
      this.exportStatus = '';
    }
  }

  exportAdvancedReport() {
    if (!this.advancedReport) return;

    try {
      const blob = new Blob([JSON.stringify(this.advancedReport, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_avance_${this.evaluationId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Rapport JSON exporté avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      console.error('Erreur export JSON:', error);
      this.snackBar.open('Erreur lors de l\'export JSON', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'positive';
      case 'NEGATIF': return 'negative';
      default: return 'neutral';
    }
  }

  getSentimentLabel(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'Positif';
      case 'NEGATIF': return 'Négatif';
      default: return 'Neutre';
    }
  }

  getInsightLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  getInsightIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }
}