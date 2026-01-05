<<<<<<< Updated upstream
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
=======
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
>>>>>>> Stashed changes

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
<<<<<<< Updated upstream
  imports: [CommonModule],
  template: `
    <div class="sentiment-analysis">
      <h3>Analyse de sentiment</h3>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  `,
  styles: [`
    .sentiment-analysis {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
  `]
})
export class SentimentAnalysisComponent {
=======
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
  @Input() autoLoad = true;

  sentimentData = signal<SentimentData | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    if (this.autoLoad && this.evaluationId) {
      this.loadSentimentAnalysis();
    }
  }

  async loadSentimentAnalysis() {
    if (!this.evaluationId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Simulation de données pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: SentimentData = {
        total: 45,
        sentiments: {
          positif: 28,
          positifPct: 62,
          neutre: 12,
          neutrePct: 27,
          negatif: 5,
          negatifPct: 11
        },
        summary: "L'analyse révèle un sentiment globalement positif avec 62% de réponses exprimant de la satisfaction. Les étudiants apprécient particulièrement la clarté des explications et l'organisation du cours.",
        keywords: [
          { word: "intéressant", count: 15 },
          { word: "clair", count: 12 },
          { word: "utile", count: 10 },
          { word: "difficile", count: 8 },
          { word: "bien", count: 7 },
          { word: "compréhensible", count: 6 }
        ]
      };

      this.sentimentData.set(mockData);
    } catch (error: any) {
      this.errorMessage.set('Erreur lors du chargement de l\'analyse des sentiments');
      console.error('Erreur sentiment analysis:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positif': return '#4CAF50';
      case 'negatif': return '#F44336';
      case 'neutre': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  }

  getPositivePercentage(): number {
    return this.sentimentData()?.sentiments.positifPct || 0;
  }

  getNegativePercentage(): number {
    return this.sentimentData()?.sentiments.negatifPct || 0;
  }

  getNeutralPercentage(): number {
    return this.sentimentData()?.sentiments.neutrePct || 0;
  }
>>>>>>> Stashed changes
}