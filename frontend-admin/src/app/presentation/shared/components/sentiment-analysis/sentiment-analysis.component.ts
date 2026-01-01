import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EvaluationService } from '../../../../core/services/evaluation.service';

export interface SentimentAnalysis {
  globalSentiment: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  averageScore: number;
  distribution: {
    POSITIF: number;
    NEGATIF: number;
    NEUTRE: number;
  };
  totalResponses: number;
  detailedAnalysis?: Array<{
    score: number;
    classification: string;
    confidence: number;
    responseId?: string;
    studentId?: string;
  }>;
  trends?: {
    scoreVariation: number;
    dominantSentiment: string;
    polarization: number;
    consistency: number;
  };
  insights?: Array<{
    type: string;
    message: string;
    confidence: string;
  }>;
}

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="sentiment-analysis-card">
      <mat-card-header>
        <mat-card-title class="title-with-icon">
          <mat-icon>psychology</mat-icon>
          Analyse des Sentiments
        </mat-card-title>
        <mat-card-subtitle>
          Analyse automatique des réponses textuelles des étudiants
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Analyse en cours...</p>
        </div>

        <div *ngIf="!loading && analysis" class="analysis-content">
          <!-- Résumé Global -->
          <div class="global-summary">
            <div class="sentiment-badge" [ngClass]="getSentimentClass(analysis.globalSentiment)">
              <mat-icon>{{ getSentimentIcon(analysis.globalSentiment) }}</mat-icon>
              <span>{{ getSentimentLabel(analysis.globalSentiment) }}</span>
            </div>
            
            <div class="score-display">
              <div class="score-circle" [ngClass]="getScoreClass(analysis.averageScore)">
                {{ (analysis.averageScore * 100).toFixed(0) }}
              </div>
              <span class="score-label">Score Moyen</span>
            </div>
          </div>

          <!-- Distribution -->
          <div class="distribution-section">
            <h4>Distribution des Sentiments</h4>
            <div class="distribution-bars">
              <div class="sentiment-bar positive">
                <div class="bar-fill" [style.width.%]="getPercentage(analysis.distribution.POSITIF)"></div>
                <span class="bar-label">
                  Positif ({{ analysis.distribution.POSITIF }})
                </span>
              </div>
              <div class="sentiment-bar negative">
                <div class="bar-fill" [style.width.%]="getPercentage(analysis.distribution.NEGATIF)"></div>
                <span class="bar-label">
                  Négatif ({{ analysis.distribution.NEGATIF }})
                </span>
              </div>
              <div class="sentiment-bar neutral">
                <div class="bar-fill" [style.width.%]="getPercentage(analysis.distribution.NEUTRE)"></div>
                <span class="bar-label">
                  Neutre ({{ analysis.distribution.NEUTRE }})
                </span>
              </div>
            </div>
          </div>

          <!-- Tendances -->
          <div *ngIf="analysis.trends" class="trends-section">
            <h4>Tendances Identifiées</h4>
            <div class="trends-grid">
              <div class="trend-item">
                <mat-icon>trending_up</mat-icon>
                <div>
                  <span class="trend-label">Variation</span>
                  <span class="trend-value">{{ analysis.trends.scoreVariation.toFixed(2) }}</span>
                </div>
              </div>
              <div class="trend-item">
                <mat-icon>poll</mat-icon>
                <div>
                  <span class="trend-label">Polarisation</span>
                  <span class="trend-value">{{ (analysis.trends.polarization * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="trend-item">
                <mat-icon>balance</mat-icon>
                <div>
                  <span class="trend-label">Consistance</span>
                  <span class="trend-value">{{ (analysis.trends.consistency * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Insights -->
          <div *ngIf="analysis.insights && analysis.insights.length > 0" class="insights-section">
            <h4>Insights Automatiques</h4>
            <div class="insights-list">
              <mat-chip-listbox>
                <mat-chip 
                  *ngFor="let insight of analysis.insights"
                  [matTooltip]="insight.message"
                  [ngClass]="getInsightClass(insight.confidence)">
                  <mat-icon>lightbulb</mat-icon>
                  {{ insight.message }}
                </mat-chip>
              </mat-chip-listbox>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-section">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="refreshAnalysis()"
              [disabled]="loading">
              <mat-icon>refresh</mat-icon>
              Actualiser l'analyse
            </button>
            
            <button 
              mat-stroked-button 
              (click)="exportAnalysis()"
              [disabled]="loading">
              <mat-icon>download</mat-icon>
              Exporter les détails
            </button>
          </div>
        </div>

        <div *ngIf="!loading && !analysis" class="no-data">
          <mat-icon>sentiment_neutral</mat-icon>
          <p>Aucune donnée d'analyse disponible</p>
          <button mat-raised-button color="primary" (click)="loadAnalysis()">
            Lancer l'analyse
          </button>
        </div>

        <div *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          <p>{{ error }}</p>
          <button mat-button (click)="loadAnalysis()">Réessayer</button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .sentiment-analysis-card {
      margin: 16px 0;
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 16px;
    }

    .analysis-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .global-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .sentiment-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
    }

    .sentiment-badge.positive {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .sentiment-badge.negative {
      background: #ffebee;
      color: #c62828;
    }

    .sentiment-badge.neutral {
      background: #f5f5f5;
      color: #666;
    }

    .score-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .score-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: white;
    }

    .score-circle.positive {
      background: #4caf50;
    }

    .score-circle.negative {
      background: #f44336;
    }

    .score-circle.neutral {
      background: #9e9e9e;
    }

    .score-label {
      font-size: 12px;
      color: #666;
    }

    .distribution-section h4,
    .trends-section h4,
    .insights-section h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .distribution-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sentiment-bar {
      position: relative;
      height: 32px;
      background: #f0f0f0;
      border-radius: 16px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 16px;
    }

    .sentiment-bar.positive .bar-fill {
      background: #4caf50;
    }

    .sentiment-bar.negative .bar-fill {
      background: #f44336;
    }

    .sentiment-bar.neutral .bar-fill {
      background: #9e9e9e;
    }

    .bar-label {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .trend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .trend-item mat-icon {
      color: #666;
    }

    .trend-label {
      display: block;
      font-size: 12px;
      color: #666;
    }

    .trend-value {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .insights-list {
      margin-top: 8px;
    }

    .insights-list mat-chip {
      margin: 4px;
      max-width: 100%;
    }

    .insights-list mat-chip.high-confidence {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .insights-list mat-chip.medium-confidence {
      background: #fff3e0;
      color: #f57c00;
    }

    .insights-list mat-chip.low-confidence {
      background: #f5f5f5;
      color: #666;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .no-data,
    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 16px;
      text-align: center;
    }

    .no-data mat-icon,
    .error-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .error-message mat-icon {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .global-summary {
        flex-direction: column;
        gap: 16px;
      }

      .trends-grid {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }
    }
  `]
})
export class SentimentAnalysisComponent implements OnInit, OnChanges {
  @Input() evaluationId!: string;
  @Input() autoLoad = true;

  analysis: SentimentAnalysis | null = null;
  loading = false;
  error: string | null = null;

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit() {
    if (this.autoLoad && this.evaluationId) {
      this.loadAnalysis();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['evaluationId'] && this.evaluationId && this.autoLoad) {
      this.loadAnalysis();
    }
  }

  async loadAnalysis() {
    if (!this.evaluationId) return;

    this.loading = true;
    this.error = null;

    try {
      this.analysis = await this.evaluationService.analyzeSentiments(this.evaluationId);
    } catch (error: any) {
      this.error = error.message || 'Erreur lors du chargement de l\'analyse des sentiments';
      console.error('Erreur analyse sentiments:', error);
    } finally {
      this.loading = false;
    }
  }

  refreshAnalysis() {
    this.loadAnalysis();
  }

  async exportAnalysis() {
    if (!this.evaluationId || !this.analysis) return;

    try {
      // Créer un blob avec les données d'analyse
      const data = {
        ...this.analysis,
        exportedAt: new Date().toISOString(),
        evaluationId: this.evaluationId
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse_sentiments_${this.evaluationId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'positive';
      case 'NEGATIF': return 'negative';
      default: return 'neutral';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'sentiment_very_satisfied';
      case 'NEGATIF': return 'sentiment_very_dissatisfied';
      default: return 'sentiment_neutral';
    }
  }

  getSentimentLabel(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'Sentiment Positif';
      case 'NEGATIF': return 'Sentiment Négatif';
      default: return 'Sentiment Neutre';
    }
  }

  getScoreClass(score: number): string {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  getPercentage(count: number): number {
    if (!this.analysis || this.analysis.totalResponses === 0) return 0;
    return (count / this.analysis.totalResponses) * 100;
  }

  getInsightClass(confidence: string): string {
    switch (confidence.toLowerCase()) {
      case 'high': return 'high-confidence';
      case 'medium': return 'medium-confidence';
      default: return 'low-confidence';
    }
  }
}