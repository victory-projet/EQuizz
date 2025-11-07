import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface FeedbackItem {
  id: string;
  studentName: string;
  quizTitle: string;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  date: Date;
}

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sentiment-analysis">
      <div class="analysis-header">
        <h2>Analyse des Sentiments</h2>
        <p class="subtitle">Analyse des retours et commentaires des étudiants</p>
      </div>

      <div class="sentiment-overview">
        <div class="sentiment-card positive">
          <div class="sentiment-icon">😊</div>
          <div class="sentiment-content">
            <h3>{{ sentimentData().positive }}</h3>
            <p>Positifs</p>
            <span class="percentage">{{ getPercentage('positive') }}%</span>
          </div>
        </div>

        <div class="sentiment-card neutral">
          <div class="sentiment-icon">😐</div>
          <div class="sentiment-content">
            <h3>{{ sentimentData().neutral }}</h3>
            <p>Neutres</p>
            <span class="percentage">{{ getPercentage('neutral') }}%</span>
          </div>
        </div>

        <div class="sentiment-card negative">
          <div class="sentiment-icon">😞</div>
          <div class="sentiment-content">
            <h3>{{ sentimentData().negative }}</h3>
            <p>Négatifs</p>
            <span class="percentage">{{ getPercentage('negative') }}%</span>
          </div>
        </div>
      </div>

      <div class="sentiment-chart">
        <h3>Distribution des sentiments</h3>
        <div class="chart-bar">
          <div 
            class="bar-segment positive" 
            [style.width.%]="getPercentage('positive')"
          ></div>
          <div 
            class="bar-segment neutral" 
            [style.width.%]="getPercentage('neutral')"
          ></div>
          <div 
            class="bar-segment negative" 
            [style.width.%]="getPercentage('negative')"
          ></div>
        </div>
      </div>

      <div class="feedback-list">
        <h3>Commentaires récents</h3>
        @for (feedback of feedbacks(); track feedback.id) {
          <div class="feedback-item" [class]="feedback.sentiment">
            <div class="feedback-header">
              <div class="student-info">
                <span class="student-name">{{ feedback.studentName }}</span>
                <span class="quiz-title">{{ feedback.quizTitle }}</span>
              </div>
              <div class="feedback-meta">
                <span class="sentiment-badge" [class]="feedback.sentiment">
                  {{ getSentimentLabel(feedback.sentiment) }}
                </span>
                <span class="feedback-date">{{ formatDate(feedback.date) }}</span>
              </div>
            </div>
            <p class="feedback-comment">{{ feedback.comment }}</p>
            <div class="feedback-score">
              Score de confiance: {{ feedback.score }}%
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>Aucun commentaire disponible</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sentiment-analysis {
      padding: 2rem;
    }

    .analysis-header {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #666;
      }
    }

    .sentiment-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .sentiment-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;

      &.positive {
        border-left: 4px solid #10b981;
      }

      &.neutral {
        border-left: 4px solid #f59e0b;
      }

      &.negative {
        border-left: 4px solid #ef4444;
      }

      .sentiment-icon {
        font-size: 3rem;
      }

      .sentiment-content {
        flex: 1;

        h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        p {
          color: #666;
          margin-bottom: 0.5rem;
        }

        .percentage {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
        }
      }
    }

    .sentiment-chart {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 1rem;
      }

      .chart-bar {
        height: 40px;
        display: flex;
        border-radius: 8px;
        overflow: hidden;

        .bar-segment {
          height: 100%;
          transition: width 0.3s;

          &.positive {
            background: #10b981;
          }

          &.neutral {
            background: #f59e0b;
          }

          &.negative {
            background: #ef4444;
          }
        }
      }
    }

    .feedback-list {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 1.5rem;
      }
    }

    .feedback-item {
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid;

      &.positive {
        background: #f0fdf4;
        border-color: #10b981;
      }

      &.neutral {
        background: #fffbeb;
        border-color: #f59e0b;
      }

      &.negative {
        background: #fef2f2;
        border-color: #ef4444;
      }
    }

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .student-name {
        font-weight: 600;
        color: #1a1a1a;
      }

      .quiz-title {
        font-size: 0.875rem;
        color: #666;
      }
    }

    .feedback-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .sentiment-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;

      &.positive {
        background: #d1fae5;
        color: #065f46;
      }

      &.neutral {
        background: #fef3c7;
        color: #92400e;
      }

      &.negative {
        background: #fee2e2;
        color: #991b1b;
      }
    }

    .feedback-date {
      font-size: 0.875rem;
      color: #666;
    }

    .feedback-comment {
      color: #1a1a1a;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }

    .feedback-score {
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class SentimentAnalysisComponent implements OnInit {
  sentimentData = signal<SentimentData>({
    positive: 0,
    neutral: 0,
    negative: 0,
    total: 0
  });

  feedbacks = signal<FeedbackItem[]>([]);

  ngOnInit(): void {
    this.loadSentimentData();
  }

  loadSentimentData(): void {
    // Simulation de données
    this.sentimentData.set({
      positive: 45,
      neutral: 30,
      negative: 15,
      total: 90
    });

    this.feedbacks.set([
      {
        id: '1',
        studentName: 'Marie Dubois',
        quizTitle: 'Mathématiques - Chapitre 5',
        comment: 'Excellent quiz ! Les questions étaient claires et bien formulées.',
        sentiment: 'positive',
        score: 92,
        date: new Date()
      },
      {
        id: '2',
        studentName: 'Pierre Martin',
        quizTitle: 'Histoire - Révolution',
        comment: 'Le quiz était intéressant mais un peu long.',
        sentiment: 'neutral',
        score: 78,
        date: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        studentName: 'Sophie Laurent',
        quizTitle: 'Physique - Mécanique',
        comment: 'Trop difficile, les questions n\'étaient pas claires.',
        sentiment: 'negative',
        score: 85,
        date: new Date(Date.now() - 7200000)
      }
    ]);
  }

  getPercentage(type: 'positive' | 'neutral' | 'negative'): number {
    const data = this.sentimentData();
    if (data.total === 0) return 0;
    return Math.round((data[type] / data.total) * 100);
  }

  getSentimentLabel(sentiment: string): string {
    const labels: Record<string, string> = {
      positive: 'Positif',
      neutral: 'Neutre',
      negative: 'Négatif'
    };
    return labels[sentiment] || sentiment;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
