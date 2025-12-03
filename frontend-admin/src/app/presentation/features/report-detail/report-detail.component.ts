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

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit {
  report = signal<ReportData | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'overview' | 'sentiment' | 'performance'>('overview');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    }
  }

  loadReport(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const apiUrl = `${environment.apiUrl}/reports/${id}`;
    
    this.http.get<ReportData>(apiUrl).subscribe({
      next: (data) => {
        console.log('📊 Report loaded:', data);
        this.report.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading report:', error);
        this.errorMessage.set('Erreur lors du chargement du rapport');
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'overview' | 'sentiment' | 'performance'): void {
    this.activeTab.set(tab);
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
