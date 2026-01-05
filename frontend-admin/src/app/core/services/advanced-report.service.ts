import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QuestionStatistics {
  id: string;
  enonce: string;
  typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
  totalReponses: number;
  options?: string[];
  distribution?: { [key: string]: number };
  distributionPct?: { [key: string]: string };
}

export interface SentimentAnalysis {
  total: number;
  sentiments: {
    positif: number;
    neutre: number;
    negatif: number;
    positifPct: string;
    neutrePct: string;
    negatifPct: string;
  };
  keywords: Array<{ word: string; count: number }>;
  summary?: string;
}

export interface EvaluationStatistics {
  totalEtudiants: number;
  nombreRepondants: number;
  tauxParticipation: number;
}

export interface AdvancedReportData {
  evaluation: {
    id: string;
    titre: string;
    cours: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
    classes: Array<{ id: string; nom: string }>;
  };
  statistics: EvaluationStatistics;
  sentimentAnalysis: SentimentAnalysis;
  questions: QuestionStatistics[];
}

export interface ReportFilters {
  classeId?: string;
  enseignantId?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeSentimentAnalysis?: boolean;
  includeChartData?: boolean;
  includeDetailedResponses?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Générer un rapport avancé pour une évaluation
   */
  generateAdvancedReport(evaluationId: string, filters?: ReportFilters): Observable<AdvancedReportData> {
    let params = new HttpParams();
    
    if (filters?.classeId) {
      params = params.set('classeId', filters.classeId);
    }
    if (filters?.enseignantId) {
      params = params.set('enseignantId', filters.enseignantId);
    }
    if (filters?.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }
    if (filters?.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    return this.http.get<AdvancedReportData>(`${this.apiUrl}/${evaluationId}/advanced`, { params });
  }

  /**
   * Analyser les sentiments d'une évaluation
   */
  analyzeSentiments(evaluationId: string, filters?: ReportFilters): Observable<SentimentAnalysis> {
    let params = new HttpParams();
    
    if (filters?.classeId) {
      params = params.set('classeId', filters.classeId);
    }

    return this.http.get<SentimentAnalysis>(`${this.apiUrl}/${evaluationId}/sentiment-analysis`, { params });
  }

  /**
   * Obtenir les réponses anonymes aux questions ouvertes
   */
  getAnonymousResponses(evaluationId: string, questionId?: string, filters?: ReportFilters): Observable<{
    responses: Array<{
      questionId: string;
      questionText: string;
      responses: Array<{
        id: string;
        contenu: string;
        sentiment?: 'POSITIF' | 'NEUTRE' | 'NEGATIF';
        dateReponse: string;
      }>;
    }>;
    total: number;
  }> {
    let params = new HttpParams();
    
    if (questionId) {
      params = params.set('questionId', questionId);
    }
    if (filters?.classeId) {
      params = params.set('classeId', filters.classeId);
    }

    return this.http.get<any>(`${this.apiUrl}/${evaluationId}/anonymous-responses`, { params });
  }

  /**
   * Exporter un rapport
   */
  exportReport(evaluationId: string, options: ExportOptions, filters?: ReportFilters): Observable<Blob> {
    let params = new HttpParams()
      .set('format', options.format);
    
    if (options.includeSentimentAnalysis) {
      params = params.set('includeSentimentAnalysis', 'true');
    }
    if (options.includeChartData) {
      params = params.set('includeChartData', 'true');
    }
    if (options.includeDetailedResponses) {
      params = params.set('includeDetailedResponses', 'true');
    }
    
    if (filters?.classeId) {
      params = params.set('classeId', filters.classeId);
    }
    if (filters?.enseignantId) {
      params = params.set('enseignantId', filters.enseignantId);
    }

    return this.http.get(`${this.apiUrl}/${evaluationId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Obtenir les statistiques de comparaison entre évaluations
   */
  getComparisonStatistics(evaluationIds: string[]): Observable<{
    evaluations: Array<{
      id: string;
      titre: string;
      tauxParticipation: number;
      moyenneSentiment: number;
      nombreQuestions: number;
    }>;
    trends: {
      participation: Array<{ date: string; taux: number }>;
      sentiment: Array<{ date: string; score: number }>;
    };
  }> {
    const params = new HttpParams().set('evaluationIds', evaluationIds.join(','));
    
    return this.http.get<any>(`${this.apiUrl}/comparison`, { params });
  }

  /**
   * Obtenir les données pour les graphiques
   */
  getChartData(evaluationId: string, chartType: 'participation' | 'sentiment' | 'questions', filters?: ReportFilters): Observable<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
    }>;
  }> {
    let params = new HttpParams().set('chartType', chartType);
    
    if (filters?.classeId) {
      params = params.set('classeId', filters.classeId);
    }

    return this.http.get<any>(`${this.apiUrl}/${evaluationId}/chart-data`, { params });
  }
}