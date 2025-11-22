import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ExportService } from '../../../core/services/export.service';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { SentimentAnalysisComponent } from './components/sentiment-analysis/sentiment-analysis.component';
import { WordCloudComponent } from './components/word-cloud/word-cloud.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, SentimentAnalysisComponent, WordCloudComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private exportService = inject(ExportService);

  activeTab = signal<'overview' | 'sentiment' | 'performance'>('overview');
  isLoading = signal(true);
  showExportMenu = signal(false);

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
    { action: 'Quiz créé', details: 'Évaluation Algorithmique', time: '2 heures', icon: 'FileText' },
    { action: 'Quiz publié', details: 'Base de Données Avancée', time: '5 heures', icon: 'Send' },
    { action: 'Résultats analysés', details: 'Réseaux Informatiques', time: '1 jour', icon: 'BarChart' }
  ]);

  getActivityIcon(icon: string): string {
    return icon;
  }

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

  toggleExportMenu(): void {
    this.showExportMenu.update(v => !v);
  }

  exportToPDF(): void {
    const stats = this.stats();
    const exportData = {
      title: 'Rapport d\'Analyses et Performances',
      date: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      stats: [
        { label: 'Quiz créés', value: stats.totalQuizzes },
        { label: 'Réponses totales', value: stats.totalResponses },
        { label: 'Score moyen', value: `${stats.averageScore}%` },
        { label: 'Taux de participation', value: `${stats.participationRate}%` },
        { label: 'Sentiment positif', value: `${stats.positiveSentiment}%` },
        { label: 'Sentiment neutre', value: `${stats.neutralSentiment}%` },
        { label: 'Sentiment négatif', value: `${stats.negativeSentiment}%` }
      ],
      tables: [
        {
          title: 'Activité Récente',
          headers: ['Action', 'Détails', 'Temps'],
          rows: this.recentActivity().map(a => [a.action, a.details, a.time])
        },
        {
          title: 'Top Performers',
          headers: ['Rang', 'Classe', 'Score', 'Tendance'],
          rows: this.topPerformers().map((p, i) => [
            `${i + 1}`,
            p.name,
            `${p.score}%`,
            p.trend === 'up' ? '↑' : '↓'
          ])
        }
      ],
      additionalInfo: 'Ce rapport a été généré automatiquement par le système EQuizz.'
    };

    this.exportService.exportToPDF(exportData);
    this.showExportMenu.set(false);
  }

  exportToExcel(): void {
    const stats = this.stats();
    const exportData = {
      title: 'Rapport d\'Analyses et Performances',
      date: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      stats: [
        { label: 'Quiz créés', value: stats.totalQuizzes },
        { label: 'Réponses totales', value: stats.totalResponses },
        { label: 'Score moyen', value: `${stats.averageScore}%` },
        { label: 'Taux de participation', value: `${stats.participationRate}%` },
        { label: 'Sentiment positif', value: `${stats.positiveSentiment}%` },
        { label: 'Sentiment neutre', value: `${stats.neutralSentiment}%` },
        { label: 'Sentiment négatif', value: `${stats.negativeSentiment}%` }
      ],
      tables: [
        {
          title: 'Activité Récente',
          headers: ['Action', 'Détails', 'Temps'],
          rows: this.recentActivity().map(a => [a.action, a.details, a.time])
        },
        {
          title: 'Top Performers',
          headers: ['Rang', 'Classe', 'Score', 'Tendance'],
          rows: this.topPerformers().map((p, i) => [
            i + 1,
            p.name,
            p.score,
            p.trend === 'up' ? 'Hausse' : 'Baisse'
          ])
        }
      ]
    };

    this.exportService.exportToExcel(exportData);
    this.showExportMenu.set(false);
  }


}
