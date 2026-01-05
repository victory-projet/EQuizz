<<<<<<< Updated upstream
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
=======
import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeSentimentAnalysis: boolean;
  includeChartData: boolean;
  includeDetailedResponses: boolean;
}

export interface ReportFilters {
  classeId: string;
  enseignantId: string;
}

export interface ReportData {
  evaluation: {
    titre: string;
    cours: string;
    statut: string;
  };
  statistics: {
    tauxParticipation: number;
    nombreRepondants: number;
    totalEtudiants: number;
  };
  questions: Array<{
    id: string;
    enonce: string;
    typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
    totalReponses: number;
    options?: string[];
    distribution?: Record<string, number>;
    distributionPct?: Record<string, number>;
  }>;
  sentimentAnalysis: {
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
  };
}

export interface AnonymousResponse {
  id: string;
  contenu: string;
  sentiment?: string;
  dateReponse: string;
}

export interface QuestionGroup {
  questionId: string;
  questionText: string;
  responses: AnonymousResponse[];
}

export interface Classe {
  id: string;
  nom: string;
}

export interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
}
>>>>>>> Stashed changes

@Component({
  selector: 'app-report-export',
  standalone: true,
<<<<<<< Updated upstream
  imports: [CommonModule],
  template: `
    <div class="report-export">
      <h3>Export de rapport</h3>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  `,
  styles: [`
    .report-export {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
  `]
})
export class ReportExportComponent {
=======
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './report-export.component.html',
  styleUrls: ['./report-export.component.scss']
})
export class ReportExportComponent implements OnInit {
  @Input() evaluationId!: string;

  // Signals for component state
  reportData = signal<ReportData | null>(null);
  isLoading = signal(false);
  isExporting = signal(false);
  exportProgress = signal(0);
  errorMessage = signal('');
  successMessage = signal('');
  activeTab = signal<'overview' | 'questions' | 'sentiment' | 'responses'>('overview');
  selectedQuestionId = signal<string | null>(null);

  // Filters and data
  filters = signal<ReportFilters>({
    classeId: '',
    enseignantId: ''
  });

  classes = signal<Classe[]>([]);
  enseignants = signal<Enseignant[]>([]);
  anonymousResponses = signal<QuestionGroup[]>([]);

  exportOptions = signal<ExportOptions>({
    format: 'excel',
    includeSentimentAnalysis: true,
    includeChartData: true,
    includeDetailedResponses: false
  });

  // Computed values
  chartData = computed(() => {
    const data = this.reportData();
    if (!data) return {};
    
    return {
      participation: {
        labels: ['Participants', 'Non-participants'],
        data: [data.statistics.nombreRepondants, data.statistics.totalEtudiants - data.statistics.nombreRepondants]
      }
    };
  });

  ngOnInit() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    this.isLoading.set(true);
    try {
      // Load classes and enseignants
      await Promise.all([
        this.loadClasses(),
        this.loadEnseignants(),
        this.loadReportData()
      ]);
    } catch (error) {
      this.errorMessage.set('Erreur lors du chargement des données');
      console.error('Error loading initial data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadClasses() {
    // Mock data - replace with actual service call
    this.classes.set([
      { id: '1', nom: 'Classe A' },
      { id: '2', nom: 'Classe B' }
    ]);
  }

  private async loadEnseignants() {
    // Mock data - replace with actual service call
    this.enseignants.set([
      { id: '1', nom: 'Dupont', prenom: 'Jean' },
      { id: '2', nom: 'Martin', prenom: 'Marie' }
    ]);
  }

  private async loadReportData() {
    if (!this.evaluationId) return;

    // Mock data - replace with actual service call
    const mockData: ReportData = {
      evaluation: {
        titre: 'Évaluation de mathématiques',
        cours: 'Mathématiques',
        statut: 'Terminée'
      },
      statistics: {
        tauxParticipation: 85,
        nombreRepondants: 17,
        totalEtudiants: 20
      },
      questions: [
        {
          id: '1',
          enonce: 'Quelle est la racine carrée de 16?',
          typeQuestion: 'CHOIX_MULTIPLE',
          totalReponses: 17,
          options: ['2', '4', '8', '16'],
          distribution: { '2': 1, '4': 15, '8': 1, '16': 0 },
          distributionPct: { '2': 6, '4': 88, '8': 6, '16': 0 }
        },
        {
          id: '2',
          enonce: 'Expliquez votre méthode de résolution',
          typeQuestion: 'REPONSE_OUVERTE',
          totalReponses: 12
        }
      ],
      sentimentAnalysis: {
        total: 12,
        sentiments: {
          positif: 8,
          positifPct: 67,
          neutre: 3,
          neutrePct: 25,
          negatif: 1,
          negatifPct: 8
        },
        summary: 'Les étudiants montrent une attitude globalement positive envers cette évaluation.',
        keywords: [
          { word: 'facile', count: 5 },
          { word: 'compréhensible', count: 3 },
          { word: 'difficile', count: 2 }
        ]
      }
    };

    this.reportData.set(mockData);
  }

  async loadAnonymousResponses() {
    // Mock data - replace with actual service call
    const mockResponses: QuestionGroup[] = [
      {
        questionId: '2',
        questionText: 'Expliquez votre méthode de résolution',
        responses: [
          {
            id: '1',
            contenu: 'J\'ai utilisé la méthode de factorisation',
            sentiment: 'positif',
            dateReponse: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            contenu: 'C\'était assez difficile à comprendre',
            sentiment: 'negatif',
            dateReponse: '2024-01-15T11:00:00Z'
          }
        ]
      }
    ];

    this.anonymousResponses.set(mockResponses);
  }

  onFilterChange() {
    this.loadReportData();
  }

  onTabChange(tab: 'overview' | 'questions' | 'sentiment' | 'responses') {
    this.activeTab.set(tab);
    if (tab === 'responses') {
      this.loadAnonymousResponses();
    }
  }

  onQuestionSelect(questionId: string) {
    this.selectedQuestionId.set(questionId);
    this.activeTab.set('responses');
    this.loadAnonymousResponses();
  }

  onExport() {
    this.exportReport();
  }

  getMultipleChoiceCount(): number {
    const data = this.reportData();
    if (!data) return 0;
    return data.questions.filter(q => q.typeQuestion === 'CHOIX_MULTIPLE').length;
  }

  getOpenQuestionCount(): number {
    const data = this.reportData();
    if (!data) return 0;
    return data.questions.filter(q => q.typeQuestion === 'REPONSE_OUVERTE').length;
  }

  getParticipationColor(percentage: number): string {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment?.toLowerCase()) {
      case 'positif': return '#4caf50';
      case 'neutre': return '#ff9800';
      case 'negatif': return '#f44336';
      default: return '#757575';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment?.toLowerCase()) {
      case 'positif': return 'sentiment_satisfied';
      case 'neutre': return 'sentiment_neutral';
      case 'negatif': return 'sentiment_dissatisfied';
      default: return 'help';
    }
  }

  // Getter/setter methods for ngModel binding
  get exportFormat() {
    return this.exportOptions().format;
  }

  set exportFormat(value: 'excel' | 'pdf') {
    this.exportOptions.update(options => ({ ...options, format: value }));
  }

  get includeSentimentAnalysis() {
    return this.exportOptions().includeSentimentAnalysis;
  }

  set includeSentimentAnalysis(value: boolean) {
    this.exportOptions.update(options => ({ ...options, includeSentimentAnalysis: value }));
  }

  get includeChartData() {
    return this.exportOptions().includeChartData;
  }

  set includeChartData(value: boolean) {
    this.exportOptions.update(options => ({ ...options, includeChartData: value }));
  }

  get includeDetailedResponses() {
    return this.exportOptions().includeDetailedResponses;
  }

  set includeDetailedResponses(value: boolean) {
    this.exportOptions.update(options => ({ ...options, includeDetailedResponses: value }));
  }

  get filterClasseId() {
    return this.filters().classeId;
  }

  set filterClasseId(value: string) {
    this.filters.update(filters => ({ ...filters, classeId: value }));
  }

  get filterEnseignantId() {
    return this.filters().enseignantId;
  }

  set filterEnseignantId(value: string) {
    this.filters.update(filters => ({ ...filters, enseignantId: value }));
  }

  async exportReport() {
    if (!this.evaluationId) return;

    this.isExporting.set(true);
    this.exportProgress.set(0);
    this.errorMessage.set('');

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        this.exportProgress.set(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate file download
      const filename = `evaluation_${this.evaluationId}_report.${this.exportOptions().format}`;
      console.log(`Exporting report: ${filename}`);
      
      // Here you would typically call a service to generate and download the file
      
    } catch (error: any) {
      this.errorMessage.set('Erreur lors de l\'export du rapport');
      console.error('Export error:', error);
    } finally {
      this.isExporting.set(false);
      this.exportProgress.set(0);
    }
  }

  updateExportOptions(options: Partial<ExportOptions>) {
    this.exportOptions.set({
      ...this.exportOptions(),
      ...options
    });
  }
>>>>>>> Stashed changes
}