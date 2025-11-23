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
    totalQuizzes: 0,
    totalResponses: 0,
    averageScore: 0,
    participationRate: 0,
    positiveSentiment: 0,
    neutralSentiment: 0,
    negativeSentiment: 0
  });

  recentActivity = signal<Array<{ action: string; details: string; time: string; icon: string }>>([]);

  getActivityIcon(icon: string): string {
    return icon;
  }

  topPerformers = signal<Array<{ name: string; score: number; trend: 'up' | 'down' }>>([]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    this.analyticsService.getOverviewData().subscribe({
      next: (data) => {
        this.stats.set({
          totalQuizzes: data.totalQuizzes || 0,
          totalResponses: 0, // À calculer depuis les résultats
          averageScore: data.averageScore || 0,
          participationRate: data.participationRate || 0,
          positiveSentiment: 0, // À implémenter avec analyse de sentiment
          neutralSentiment: 0,
          negativeSentiment: 0
        });

        // Mapper les activités récentes
        this.recentActivity.set(
          (data.recentActivities || []).map(activity => ({
            action: this.getActionLabel(activity.type),
            details: activity.message,
            time: this.getRelativeTime(activity.timestamp),
            icon: this.getActivityIconForType(activity.type)
          }))
        );

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.isLoading.set(false);
      }
    });
  }

  private getActionLabel(type: string): string {
    const labels: Record<string, string> = {
      quiz_published: 'Quiz publié',
      quiz_created: 'Quiz créé',
      quiz_completed: 'Quiz complété',
      results_analyzed: 'Résultats analysés'
    };
    return labels[type] || type;
  }

  private getActivityIconForType(type: string): string {
    const icons: Record<string, string> = {
      quiz_published: 'Send',
      quiz_created: 'FileText',
      quiz_completed: 'CheckCircle',
      results_analyzed: 'BarChart'
    };
    return icons[type] || 'FileText';
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Récent';
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
