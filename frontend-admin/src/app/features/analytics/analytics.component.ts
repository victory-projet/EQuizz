import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SentimentAnalysisComponent } from './components/sentiment-analysis/sentiment-analysis.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, SentimentAnalysisComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  activeTab = signal<'overview' | 'sentiment' | 'performance'>('overview');
  isLoading = signal(true);

  stats = signal({
    totalQuizzes: 24,
    totalResponses: 1250,
    averageScore: 72,
    participationRate: 85,
    positiveSentiment: 78,
    neutralSentiment: 15,
    negativeSentiment: 7
  });

  recentActivity = signal([
    { action: 'Quiz créé', details: 'Évaluation Algorithmique', time: '2 heures', icon: '📝' },
    { action: 'Quiz publié', details: 'Base de Données Avancée', time: '5 heures', icon: '🚀' },
    { action: 'Résultats analysés', details: 'Réseaux Informatiques', time: '1 jour', icon: '📊' }
  ]);

  topPerformers = signal([
    { name: 'L1 Info A', score: 85, trend: 'up' as const },
    { name: 'L2 Info', score: 82, trend: 'up' as const },
    { name: 'L1 Info B', score: 78, trend: 'down' as const }
  ]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    this.analyticsService.getOverviewData().subscribe({
      next: (data) => {
        this.stats.update(s => ({
          ...s,
          totalQuizzes: data.totalQuizzes,
          averageScore: data.averageScore
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'overview' | 'sentiment' | 'performance'): void {
    this.activeTab.set(tab);
  }

  exportReport(): void {
    const data = {
      stats: this.stats(),
      recentActivity: this.recentActivity(),
      topPerformers: this.topPerformers(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
