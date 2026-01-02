import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportStatistics {
  totalStudents: number;
  totalRespondents: number;
  participationRate: number;
  totalQuestions: number;
  averageScore: number;
  averageTime: number;
  successRate: number;
}

export interface McqOption {
  texte: string;
  count: number;
  percentage: number;
}

export interface McqQuestion {
  id: string;
  titre: string;
  options: McqOption[];
}

export interface OpenResponse {
  texte: string;
  dateReponse: Date;
}

export interface OpenQuestion {
  id: string;
  titre: string;
  responses: OpenResponse[];
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

export interface EvaluationReportData {
  evaluation: {
    id: string;
    titre: string;
    description: string;
    dateCreation: Date;
    dateDebut: Date;
    dateFin: Date;
    cours: any;
  };
  statistics: ReportStatistics;
  mcqQuestions: McqQuestion[];
  openQuestions: OpenQuestion[];
  sentimentData: SentimentData;
}

export interface FilterOptions {
  classes: Array<{ id: string; nom: string }>;
  enseignants: Array<{ id: string; nom: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer le rapport complet d'une évaluation
   */
  getEvaluationReport(evaluationId: string, filters?: { classe?: string; enseignant?: string }): Observable<EvaluationReportData> {
    let params = new HttpParams();
    
    if (filters?.classe) {
      params = params.set('classe', filters.classe);
    }
    
    if (filters?.enseignant) {
      params = params.set('enseignant', filters.enseignant);
    }

    return this.http.get<EvaluationReportData>(`${this.apiUrl}/evaluations/${evaluationId}`, { params });
  }

  /**
   * Récupérer les options de filtrage (classes, enseignants)
   */
  getFilterOptions(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>(`${this.apiUrl}/filter-options`);
  }

  /**
   * Exporter un rapport en PDF
   */
  exportToPDF(evaluationId: string): Observable<{ message: string; downloadUrl: string }> {
    return this.http.post<{ message: string; downloadUrl: string }>(`${this.apiUrl}/evaluations/${evaluationId}/export-pdf`, {});
  }

  /**
   * Télécharger le fichier PDF généré
   */
  downloadPDF(downloadUrl: string): Observable<Blob> {
    return this.http.get(downloadUrl, { responseType: 'blob' });
  }
}