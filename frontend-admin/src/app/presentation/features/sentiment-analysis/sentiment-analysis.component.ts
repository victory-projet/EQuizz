import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface SentimentData {
  total: number;
  sentiments: {
    positif: number;
    positifPct: number;
    neutre: number;
    neutrePct: number;
    negatif: number;
    negatifPct: number;
  };
  summary?: string;
  keywords: Array<{
    word: string;
    count: number;
  }>;
}

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './sentiment-analysis.component.html',
  styleUrls: ['./sentiment-analysis.component.scss']
})
export class SentimentAnalysisComponent implements OnInit {
  @Input() evaluationId!: string;

  sentimentData = signal<SentimentData | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.loadSentimentData();
  }

  private async loadSentimentData() {
    if (!this.evaluationId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Mock data - replace with actual service call
      const mockData: SentimentData = {
        total: 25,
        sentiments: {
          positif: 15,
          positifPct: 60,
          neutre: 7,
          neutrePct: 28,
          negatif: 3,
          negatifPct: 12
        },
        summary: 'L\'analyse révèle une attitude globalement positive des étudiants envers cette évaluation.',
        keywords: [
          { word: 'facile', count: 8 },
          { word: 'intéressant', count: 6 },
          { word: 'clair', count: 5 },
          { word: 'difficile', count: 3 },
          { word: 'confus', count: 2 }
        ]
      };

      this.sentimentData.set(mockData);
    } catch (error) {
      this.errorMessage.set('Erreur lors du chargement de l\'analyse de sentiment');
      console.error('Error loading sentiment data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positif': return '#4caf50';
      case 'neutre': return '#ff9800';
      case 'negatif': return '#f44336';
      default: return '#757575';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positif': return 'sentiment_satisfied';
      case 'neutre': return 'sentiment_neutral';
      case 'negatif': return 'sentiment_dissatisfied';
      default: return 'help';
    }
  }

  refreshAnalysis() {
    this.loadSentimentData();
  }

  getPositivePercentage(): number {
    const data = this.sentimentData();
    return data?.sentiments.positifPct || 0;
  }

  getNegativePercentage(): number {
    const data = this.sentimentData();
    return data?.sentiments.negatifPct || 0;
  }

  getNeutralPercentage(): number {
    const data = this.sentimentData();
    return data?.sentiments.neutrePct || 0;
  }
}