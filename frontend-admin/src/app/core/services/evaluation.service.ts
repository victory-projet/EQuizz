import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Evaluation {
  id: string;
  titre: string;
  description?: string;
  statut: 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE';
  cours_id: string;
  administrateur_id: string;
  dateCreation: string;
  createdAt: string;
  updatedAt: string;
  Cours?: {
    id: string;
    nom: string;
  };
  Quizz?: {
    id: string;
    titre: string;
    Questions?: Question[];
  };
  Classes?: Array<{
    id: string;
    nom: string;
  }>;
}

export interface Question {
  id: string;
  enonce: string;
  typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
  options?: string[];
  quizz_id: string;
}

export interface Submission {
  id: string;
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    classe?: string;
  };
  dateDebut: string;
  dateFin?: string;
  estTermine: boolean;
  reponses: Array<{
    questionId: string;
    question: string;
    reponse: string;
    dateReponse: string;
  }>;
}

export interface SentimentAnalysis {
  globalSentiment: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  averageScore: number;
  distribution: {
    POSITIF: number;
    NEGATIF: number;
    NEUTRE: number;
  };
  totalResponses: number;
  detailedAnalysis?: Array<{
    score: number;
    classification: string;
    confidence: number;
    responseId?: string;
    studentId?: string;
  }>;
  trends?: {
    scoreVariation: number;
    dominantSentiment: string;
    polarization: number;
    consistency: number;
  };
  insights?: Array<{
    type: string;
    message: string;
    confidence: string;
  }>;
}

export interface AdvancedReport {
  evaluation: {
    id: string;
    titre: string;
    statut: string;
    cours: string;
    dateCreation: string;
    nombreQuestions: number;
  };
  statistics: {
    totalSubmissions: number;
    completedSubmissions: number;
    completionRate: number;
    avgCompletionTime: number;
    classeDistribution: { [key: string]: number };
  };
  sentimentAnalysis: SentimentAnalysis;
  questionAnalysis: Array<{
    id: string;
    enonce: string;
    type: string;
    responseCount: number;
    responseRate: number;
    responses: string[];
  }>;
  insights: Array<{
    type: string;
    level: string;
    message: string;
    recommendation: string;
  }>;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private readonly apiUrl = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  // CRUD Operations
  create(evaluation: Partial<Evaluation>): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.apiUrl, evaluation);
  }

  findAll(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.apiUrl);
  }

  findOne(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
  }

  update(id: string, evaluation: Partial<Evaluation>): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Question Management
  addQuestion(quizzId: string, question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/quizz/${quizzId}/questions`, question);
  }

  updateQuestion(questionId: string, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${questionId}`, question);
  }

  removeQuestion(questionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/questions/${questionId}`);
  }

  importQuestions(quizzId: string, file: File): Observable<{ message: string; questions: Question[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string; questions: Question[] }>(
      `${this.apiUrl}/quizz/${quizzId}/import`,
      formData
    );
  }

  // Evaluation Lifecycle
  publish(id: string): Observable<{ message: string; evaluation: Evaluation }> {
    return this.http.post<{ message: string; evaluation: Evaluation }>(`${this.apiUrl}/${id}/publish`, {});
  }

  close(id: string): Observable<{ message: string; evaluation: Evaluation }> {
    return this.http.post<{ message: string; evaluation: Evaluation }>(`${this.apiUrl}/${id}/close`, {});
  }

  duplicate(id: string): Observable<{ message: string; evaluation: Evaluation }> {
    return this.http.post<{ message: string; evaluation: Evaluation }>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  // Submissions and Analysis
  getSubmissions(id: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/${id}/submissions`);
  }

  // New: Sentiment Analysis
  async analyzeSentiments(id: string): Promise<SentimentAnalysis> {
    return firstValueFrom(
      this.http.get<SentimentAnalysis>(`${this.apiUrl}/${id}/sentiment-analysis`)
    );
  }

  // New: Advanced Report Generation
  async generateAdvancedReport(id: string): Promise<AdvancedReport> {
    return firstValueFrom(
      this.http.get<AdvancedReport>(`${this.apiUrl}/${id}/advanced-report`)
    );
  }

  // New: Export Report
  async exportReport(id: string, queryParams: string): Promise<Blob> {
    const url = `${this.apiUrl}/${id}/export?${queryParams}`;
    
    return firstValueFrom(
      this.http.get(url, {
        responseType: 'blob',
        observe: 'body'
      })
    );
  }

  // Helper Methods
  getEvaluationStatusLabel(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'Brouillon';
      case 'PUBLIEE': return 'Publiée';
      case 'CLOTUREE': return 'Clôturée';
      default: return status;
    }
  }

  getEvaluationStatusColor(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'warn';
      case 'PUBLIEE': return 'primary';
      case 'CLOTUREE': return 'accent';
      default: return 'basic';
    }
  }

  canEditEvaluation(evaluation: Evaluation): boolean {
    return evaluation.statut === 'BROUILLON';
  }

  canPublishEvaluation(evaluation: Evaluation): boolean {
    return evaluation.statut === 'BROUILLON' && 
           !!evaluation.Quizz?.Questions && 
           evaluation.Quizz.Questions.length > 0;
  }

  canCloseEvaluation(evaluation: Evaluation): boolean {
    return evaluation.statut === 'PUBLIEE';
  }

  canDeleteEvaluation(evaluation: Evaluation): boolean {
    return evaluation.statut === 'BROUILLON';
  }

  // Statistics Helpers
  calculateCompletionRate(submissions: Submission[]): number {
    if (submissions.length === 0) return 0;
    const completed = submissions.filter(s => s.estTermine).length;
    return Math.round((completed / submissions.length) * 100);
  }

  calculateAverageCompletionTime(submissions: Submission[]): number {
    const completedSubmissions = submissions.filter(s => 
      s.estTermine && s.dateDebut && s.dateFin
    );
    
    if (completedSubmissions.length === 0) return 0;

    const totalMinutes = completedSubmissions.reduce((sum, submission) => {
      const start = new Date(submission.dateDebut);
      const end = new Date(submission.dateFin!);
      return sum + ((end.getTime() - start.getTime()) / (1000 * 60));
    }, 0);

    return Math.round(totalMinutes / completedSubmissions.length);
  }

  getSubmissionsByStatus(submissions: Submission[]): { completed: number; inProgress: number } {
    const completed = submissions.filter(s => s.estTermine).length;
    const inProgress = submissions.length - completed;
    return { completed, inProgress };
  }

  getSubmissionsByClass(submissions: Submission[]): { [className: string]: number } {
    return submissions.reduce((acc, submission) => {
      const className = submission.etudiant.classe || 'Non assigné';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {} as { [className: string]: number });
  }

  // Validation Helpers
  validateEvaluationData(evaluation: Partial<Evaluation>): string[] {
    const errors: string[] = [];

    if (!evaluation.titre || evaluation.titre.trim().length === 0) {
      errors.push('Le titre est obligatoire');
    }

    if (!evaluation.cours_id) {
      errors.push('Le cours est obligatoire');
    }

    if (evaluation.titre && evaluation.titre.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères');
    }

    if (evaluation.description && evaluation.description.length > 1000) {
      errors.push('La description ne peut pas dépasser 1000 caractères');
    }

    return errors;
  }

  validateQuestionData(question: Partial<Question>): string[] {
    const errors: string[] = [];

    if (!question.enonce || question.enonce.trim().length === 0) {
      errors.push('L\'énoncé est obligatoire');
    }

    if (!question.typeQuestion) {
      errors.push('Le type de question est obligatoire');
    }

    if (question.typeQuestion === 'CHOIX_MULTIPLE') {
      if (!question.options || question.options.length < 2) {
        errors.push('Au moins 2 options sont requises pour un choix multiple');
      }
    }

    if (question.enonce && question.enonce.length > 500) {
      errors.push('L\'énoncé ne peut pas dépasser 500 caractères');
    }

    return errors;
  }
}