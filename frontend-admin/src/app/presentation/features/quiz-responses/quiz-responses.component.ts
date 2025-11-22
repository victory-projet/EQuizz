import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ExportService } from '../../../core/services/export.service';

interface QuizResponse {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  className: string;
  submittedAt: Date;
  score: number;
  maxScore: number;
  percentage: number;
  duration: number; // en minutes
  answers: Answer[];
}

interface Answer {
  questionId: string;
  questionText: string;
  questionType: 'QCM' | 'open';
  studentAnswer: string | string[];
  correctAnswer?: string | string[];
  isCorrect?: boolean;
  points: number;
  maxPoints: number;
}

@Component({
  selector: 'app-quiz-responses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-responses.component.html',
  styleUrls: ['./quiz-responses.component.scss']
})
export class QuizResponsesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  quizId = signal<string>('');
  quizTitle = signal('');
  responses = signal<QuizResponse[]>([]);
  filteredResponses = signal<QuizResponse[]>([]);
  selectedResponse = signal<QuizResponse | null>(null);
  
  searchTerm = '';
  filterClass = signal<string>('all');
  filterStatus = signal<'all' | 'passed' | 'failed'>('all');
  
  // Stats
  totalResponses = signal(0);
  averageScore = signal(0);
  passRate = signal(0);
  averageDuration = signal(0);

  // View mode
  showDetailModal = signal(false);

  ngOnInit(): void {
    this.quizId.set(this.route.snapshot.params['id'] || 'quiz-1');
    this.loadQuizResponses();
  }

  loadQuizResponses(): void {
    // Mock data - À remplacer par un vrai service
    this.quizTitle.set('Évaluation Algorithmique - Semestre 1');
    
    const mockResponses: QuizResponse[] = [
      {
        id: 'resp-1',
        studentId: 'student-1',
        studentName: 'Marie Dubois',
        studentEmail: 'marie.dubois@student.com',
        className: 'L1 Info A',
        submittedAt: new Date('2024-11-15T14:30:00'),
        score: 18,
        maxScore: 20,
        percentage: 90,
        duration: 45,
        answers: [
          {
            questionId: 'q1',
            questionText: 'Quelle est la complexité temporelle de la recherche binaire ?',
            questionType: 'QCM',
            studentAnswer: 'O(log n)',
            correctAnswer: 'O(log n)',
            isCorrect: true,
            points: 2,
            maxPoints: 2
          },
          {
            questionId: 'q2',
            questionText: 'Expliquez le principe du tri rapide (QuickSort)',
            questionType: 'open',
            studentAnswer: 'Le tri rapide est un algorithme de tri par division qui choisit un pivot et partitionne le tableau en deux sous-tableaux.',
            points: 8,
            maxPoints: 10
          }
        ]
      },
      {
        id: 'resp-2',
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        studentEmail: 'pierre.martin@student.com',
        className: 'L1 Info A',
        submittedAt: new Date('2024-11-15T14:45:00'),
        score: 14,
        maxScore: 20,
        percentage: 70,
        duration: 52,
        answers: [
          {
            questionId: 'q1',
            questionText: 'Quelle est la complexité temporelle de la recherche binaire ?',
            questionType: 'QCM',
            studentAnswer: 'O(n)',
            correctAnswer: 'O(log n)',
            isCorrect: false,
            points: 0,
            maxPoints: 2
          },
          {
            questionId: 'q2',
            questionText: 'Expliquez le principe du tri rapide (QuickSort)',
            questionType: 'open',
            studentAnswer: 'C\'est un algorithme de tri qui utilise la récursivité.',
            points: 6,
            maxPoints: 10
          }
        ]
      },
      {
        id: 'resp-3',
        studentId: 'student-3',
        studentName: 'Sophie Laurent',
        studentEmail: 'sophie.laurent@student.com',
        className: 'L1 Info B',
        submittedAt: new Date('2024-11-15T15:00:00'),
        score: 16,
        maxScore: 20,
        percentage: 80,
        duration: 48,
        answers: [
          {
            questionId: 'q1',
            questionText: 'Quelle est la complexité temporelle de la recherche binaire ?',
            questionType: 'QCM',
            studentAnswer: 'O(log n)',
            correctAnswer: 'O(log n)',
            isCorrect: true,
            points: 2,
            maxPoints: 2
          },
          {
            questionId: 'q2',
            questionText: 'Expliquez le principe du tri rapide (QuickSort)',
            questionType: 'open',
            studentAnswer: 'Le QuickSort choisit un élément pivot et réorganise le tableau de sorte que les éléments plus petits soient à gauche et les plus grands à droite.',
            points: 9,
            maxPoints: 10
          }
        ]
      }
    ];

    this.responses.set(mockResponses);
    this.filteredResponses.set(mockResponses);
    this.updateStats();
  }

  updateStats(): void {
    const responses = this.responses();
    this.totalResponses.set(responses.length);
    
    if (responses.length > 0) {
      const avgScore = responses.reduce((sum, r) => sum + r.percentage, 0) / responses.length;
      this.averageScore.set(Math.round(avgScore));
      
      const passed = responses.filter(r => r.percentage >= 50).length;
      this.passRate.set(Math.round((passed / responses.length) * 100));
      
      const avgDur = responses.reduce((sum, r) => sum + r.duration, 0) / responses.length;
      this.averageDuration.set(Math.round(avgDur));
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.responses();

    // Filtre par recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.studentName.toLowerCase().includes(search) ||
        r.studentEmail.toLowerCase().includes(search) ||
        r.className.toLowerCase().includes(search)
      );
    }

    // Filtre par classe
    if (this.filterClass() !== 'all') {
      filtered = filtered.filter(r => r.className === this.filterClass());
    }

    // Filtre par statut
    if (this.filterStatus() !== 'all') {
      if (this.filterStatus() === 'passed') {
        filtered = filtered.filter(r => r.percentage >= 50);
      } else {
        filtered = filtered.filter(r => r.percentage < 50);
      }
    }

    this.filteredResponses.set(filtered);
  }

  getUniqueClasses(): string[] {
    const classes = new Set(this.responses().map(r => r.className));
    return Array.from(classes).sort();
  }

  viewDetails(response: QuizResponse): void {
    this.selectedResponse.set(response);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedResponse.set(null);
  }

  getScoreClass(percentage: number): string {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 70) return 'score-good';
    if (percentage >= 50) return 'score-average';
    return 'score-poor';
  }

  exportResponses(): void {
    const exportData = {
      title: `Réponses - ${this.quizTitle()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      stats: [
        { label: 'Total réponses', value: this.totalResponses() },
        { label: 'Score moyen', value: `${this.averageScore()}%` },
        { label: 'Taux de réussite', value: `${this.passRate()}%` },
        { label: 'Durée moyenne', value: `${this.averageDuration()} min` }
      ],
      tables: [
        {
          title: 'Résultats des étudiants',
          headers: ['Étudiant', 'Classe', 'Score', 'Pourcentage', 'Durée', 'Date'],
          rows: this.filteredResponses().map(r => [
            r.studentName,
            r.className,
            `${r.score}/${r.maxScore}`,
            `${r.percentage}%`,
            `${r.duration} min`,
            this.formatDate(r.submittedAt)
          ])
        }
      ]
    };

    this.exportService.exportToPDF(exportData);
    this.toastService.success('Rapport exporté avec succès');
  }

  exportToExcel(): void {
    const exportData = {
      title: `Réponses - ${this.quizTitle()}`,
      date: new Date().toLocaleDateString('fr-FR'),
      stats: [
        { label: 'Total réponses', value: this.totalResponses() },
        { label: 'Score moyen', value: `${this.averageScore()}%` },
        { label: 'Taux de réussite', value: `${this.passRate()}%` },
        { label: 'Durée moyenne', value: `${this.averageDuration()} min` }
      ],
      tables: [
        {
          title: 'Résultats des étudiants',
          headers: ['Étudiant', 'Email', 'Classe', 'Score', 'Pourcentage', 'Durée', 'Date'],
          rows: this.filteredResponses().map(r => [
            r.studentName,
            r.studentEmail,
            r.className,
            `${r.score}/${r.maxScore}`,
            r.percentage,
            r.duration,
            this.formatDate(r.submittedAt)
          ])
        }
      ]
    };

    this.exportService.exportToExcel(exportData);
    this.toastService.success('Données exportées en Excel');
  }

  goBack(): void {
    this.router.navigate(['/quiz-management']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}
