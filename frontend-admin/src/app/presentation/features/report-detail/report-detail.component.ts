import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ReportData {
  evaluation: {
    id: string;
    titre: string;
    cours: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
    classes: Array<{ id: string; nom: string }>;
  };
  statistics: {
    totalEtudiants: number;
    nombreRepondants: number;
    tauxParticipation: number;
  };
  sentimentAnalysis?: {
    total: number;
    sentiments: {
      positif: number;
      neutre: number;
      negatif: number;
      positifPct: string;
      neutrePct: string;
      negatifPct: string;
    };
    keywords?: Array<{ word: string; count: number }>;
    summary?: string;
  };
  questions: any[];
}

interface QuestionStat {
  id: string;
  enonce: string;
  typeQuestion: string;
  ordre: number;
  options: string[];
  totalReponses: number;
  distribution: Record<string, number>;
  distributionPct: Record<string, number>;
  parClasse: Array<{
    classeId: string;
    classeNom: string;
    ecoleId: string;
    ecoleNom: string;
    totalReponses: number;
    distribution: Record<string, number>;
    distributionPct: Record<string, number>;
  }>;
  parEcole: Array<{
    ecoleId: string;
    ecoleNom: string;
    totalReponses: number;
    distribution: Record<string, number>;
    distributionPct: Record<string, number>;
  }>;
}

interface QuestionStatsData {
  evaluationId: string;
  titre: string;
  statut: string;
  cours: string;
  classes: Array<{ id: string; nom: string; ecole: string }>;
  questions: QuestionStat[];
}

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit {
  report = signal<ReportData | null>(null);
  questionStats = signal<QuestionStatsData | null>(null);
  isLoading = signal(false);
  isLoadingStats = signal(false);
  errorMessage = signal('');
  activeTab = signal<'overview' | 'sentiment' | 'performance' | 'questions'>('overview');
  selectedView = signal<'global' | 'parClasse' | 'parEcole'>('global');
  evaluationId = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.evaluationId.set(id);
      this.loadReport(id);
    }
  }

  loadReport(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const apiUrl = `${environment.apiUrl}/reports/${id}`;
    
    this.http.get<ReportData>(apiUrl).subscribe({
      next: (data) => {
        this.report.set(data);
        this.isLoading.set(false);
        // Charger les stats questions si l'évaluation est clôturée
        if (data.evaluation.statut === 'CLOTUREE') {
          this.loadQuestionStats(id);
        }
      },
      error: (error) => {
        console.error('❌ Error loading report:', error);
        this.errorMessage.set('Erreur lors du chargement du rapport');
        this.isLoading.set(false);
      }
    });
  }

  loadQuestionStats(id: string): void {
    this.isLoadingStats.set(true);
    this.http.get<QuestionStatsData>(`${environment.apiUrl}/reports/${id}/question-stats`).subscribe({
      next: (data) => {
        this.questionStats.set(data);
        this.isLoadingStats.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading question stats:', err);
        this.isLoadingStats.set(false);
      }
    });
  }

  setActiveTab(tab: 'overview' | 'sentiment' | 'performance' | 'questions'): void {
    this.activeTab.set(tab);
  }

  setSelectedView(view: 'global' | 'parClasse' | 'parEcole'): void {
    this.selectedView.set(view);
  }

  getOptionColor(index: number): string {
    const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    return colors[index % colors.length];
  }

  getMaxCount(distribution: Record<string, number>): number {
    return Math.max(...Object.values(distribution), 1);
  }

  exportPDF(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const apiUrl = `${environment.apiUrl}/reports/${id}/pdf`;
      
      // Utiliser HttpClient pour inclure le token d'authentification
      this.http.get(apiUrl, { 
        responseType: 'blob',
        observe: 'response'
      }).subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport-evaluation-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('❌ Erreur export PDF:', error);
          alert('Erreur lors de l\'export PDF. Vérifiez votre connexion.');
        }
      });
    }
  }



  backToList(): void {
    this.router.navigate(['/reports']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getParticipationColor(rate: number): string {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  }

  getClassesNames(): string {
    const report = this.report();
    if (report && report.evaluation.classes && report.evaluation.classes.length > 0) {
      return report.evaluation.classes.map(c => c.nom).join(', ');
    }
    return 'Toutes les classes';
  }
}
