import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService, EvaluationReportData, McqQuestion, OpenQuestion, SentimentData, ReportStatistics } from '../../../../core/services/report.service';
import { PdfExportService } from '../../../../core/services/pdf-export.service';

@Component({
  selector: 'app-evaluation-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-results.component.html',
  styleUrls: ['./evaluation-results.component.scss']
})
export class EvaluationResultsComponent implements OnInit {
  evaluationId: string | null = null;
  evaluationTitle = '';
  courseInfo = '';
  dateRange = '';
  
  activeTab = 'overview';
  loading = false;
  showFilters = false;
  
  // Données complètes pour l'export
  currentReportData: EvaluationReportData | null = null;
  
  // Filtres
  selectedClass = '';
  selectedTeacher = '';
  classes: any[] = [];
  teachers: any[] = [];
  
  // Données
  statistics: ReportStatistics = {
    totalStudents: 0,
    totalRespondents: 0,
    participationRate: 0,
    totalQuestions: 0,
    averageScore: 0,
    averageTime: 0,
    successRate: 0
  };
  
  mcqQuestions: McqQuestion[] = [];
  openQuestions: OpenQuestion[] = [];
  
  sentimentData: SentimentData = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit(): void {
    this.evaluationId = this.route.snapshot.paramMap.get('id');
    this.loadFilterOptions();
    this.loadReportData();
  }

  private loadReportData(): void {
    if (!this.evaluationId) return;
    
    this.loading = true;
    
    const filters = {
      classe: this.selectedClass || undefined,
      enseignant: this.selectedTeacher || undefined
    };

    this.reportService.getEvaluationReport(this.evaluationId, filters).subscribe({
      next: (data: EvaluationReportData) => {
        this.currentReportData = data;
        this.updateComponentData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport:', error);
        this.loadMockData(); // Fallback vers les données simulées
        this.loading = false;
      }
    });
  }

  private loadFilterOptions(): void {
    this.reportService.getFilterOptions().subscribe({
      next: (options) => {
        this.classes = options.classes;
        this.teachers = options.enseignants;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des options de filtrage:', error);
        // Utiliser des données par défaut
        this.classes = [
          { id: '1', nom: 'INFO-L3-A' },
          { id: '2', nom: 'INFO-L3-B' },
          { id: '3', nom: 'INFO-M1' }
        ];
        
        this.teachers = [
          { id: '1', nom: 'Prof. Martin' },
          { id: '2', nom: 'Dr. Dubois' },
          { id: '3', nom: 'Prof. Leroy' }
        ];
      }
    });
  }

  private updateComponentData(data: EvaluationReportData): void {
    // Mettre à jour les informations de base
    this.evaluationTitle = data.evaluation.titre;
    this.courseInfo = data.evaluation.cours?.nom || 'Cours non spécifié';
    
    // Formater les dates
    const dateDebut = new Date(data.evaluation.dateDebut).toLocaleDateString('fr-FR');
    const dateFin = new Date(data.evaluation.dateFin).toLocaleDateString('fr-FR');
    this.dateRange = `${dateDebut} - ${dateFin}`;
    
    // Mettre à jour les statistiques
    this.statistics = data.statistics;
    
    // Mettre à jour les questions
    this.mcqQuestions = data.mcqQuestions;
    this.openQuestions = data.openQuestions;
    
    // Mettre à jour les données de sentiment
    this.sentimentData = data.sentimentData;
  }

  private loadMockData(): void {
    // Créer des données simulées complètes pour l'export
    this.currentReportData = {
      evaluation: {
        id: this.evaluationId || '1',
        titre: 'Évaluation Mi-Parcours - Bases de Données',
        description: 'Évaluation des connaissances en bases de données',
        dateCreation: new Date('2025-10-15'),
        dateDebut: new Date('2025-11-01'),
        dateFin: new Date('2025-12-31'),
        cours: { nom: 'Bases de Données Avancées' }
      },
      statistics: {
        totalStudents: 25,
        totalRespondents: 18,
        participationRate: 72,
        totalQuestions: 8,
        averageScore: 78.5,
        averageTime: 15.2,
        successRate: 85
      },
      mcqQuestions: [
        {
          id: '1',
          titre: 'Quelle est la définition correcte d\'une clé primaire ?',
          options: [
            { texte: 'Un identifiant unique pour chaque ligne', count: 12, percentage: 67 },
            { texte: 'Une colonne qui peut être nulle', count: 3, percentage: 17 },
            { texte: 'Une référence vers une autre table', count: 2, percentage: 11 },
            { texte: 'Une contrainte optionnelle', count: 1, percentage: 5 }
          ]
        },
        {
          id: '2',
          titre: 'Que signifie ACID en base de données ?',
          options: [
            { texte: 'Atomicité, Cohérence, Isolation, Durabilité', count: 14, percentage: 78 },
            { texte: 'Accès, Contrôle, Index, Données', count: 2, percentage: 11 },
            { texte: 'Autre définition incorrecte', count: 1, percentage: 6 },
            { texte: 'Je ne sais pas', count: 1, percentage: 5 }
          ]
        }
      ],
      openQuestions: [
        {
          id: '3',
          titre: 'Expliquez les avantages de la normalisation en base de données',
          responses: [
            {
              texte: 'La normalisation permet de réduire la redondance des données et d\'éviter les anomalies de mise à jour.',
              dateReponse: new Date('2025-11-15T10:30:00')
            },
            {
              texte: 'Elle améliore l\'intégrité des données et facilite la maintenance de la base.',
              dateReponse: new Date('2025-11-15T11:45:00')
            },
            {
              texte: 'Cela permet d\'économiser l\'espace de stockage et d\'optimiser les performances.',
              dateReponse: new Date('2025-11-15T14:20:00')
            },
            {
              texte: 'La normalisation aide à structurer les données de manière logique et cohérente.',
              dateReponse: new Date('2025-11-16T09:15:00')
            }
          ]
        }
      ],
      sentimentData: {
        positive: 65,
        neutral: 25,
        negative: 10
      }
    };

    // Mettre à jour l'affichage
    this.updateComponentData(this.currentReportData);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    console.log('Filtres appliqués:', {
      classe: this.selectedClass,
      enseignant: this.selectedTeacher
    });
    this.loadReportData();
  }

  exportToPDF(): void {
    if (!this.currentReportData) {
      alert('Aucune donnée disponible pour l\'export');
      return;
    }

    try {
      this.pdfExportService.exportEvaluationReport(this.currentReportData);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  }

  goBack(): void {
    this.router.navigate(['/evaluations']);
  }
}