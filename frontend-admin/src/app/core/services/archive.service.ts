import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ArchiveStats {
  [key: string]: {
    total: number;
    active: number;
    archived: number;
    archiveRate: number;
  };
}

export interface ArchivedEntity {
  id: string;
  type: string;
  title: string;
  dateArchivage: string;
  archivedBy?: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface CleanupResult {
  [key: string]: {
    found: number;
    deleted: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private readonly baseUrl = `${environment.apiUrl}/archivage`;

  constructor(private http: HttpClient) {}

  /**
   * Archive une entité
   */
  async archiveEntity(modelName: string, entityId: string): Promise<any> {
    const url = `${this.baseUrl}/${modelName}/${entityId}/archive`;
    return firstValueFrom(this.http.post(url, {}));
  }

  /**
   * Restaure une entité archivée
   */
  async restoreEntity(modelName: string, entityId: string): Promise<any> {
    const url = `${this.baseUrl}/${modelName}/${entityId}/restore`;
    return firstValueFrom(this.http.post(url, {}));
  }

  /**
   * Récupère les entités archivées d'un type
   */
  async getArchivedEntities(modelName: string, page: number = 1, limit: number = 50): Promise<any[]> {
    const url = `${this.baseUrl}/${modelName}/archived`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    const response = await firstValueFrom(this.http.get<any>(url, { params }));
    return response.entities || response;
  }

  /**
   * Supprime définitivement une entité archivée
   */
  async permanentDelete(modelName: string, entityId: string): Promise<any> {
    const url = `${this.baseUrl}/${modelName}/${entityId}/permanent`;
    return firstValueFrom(this.http.delete(url));
  }

  /**
   * Récupère les statistiques d'archivage
   */
  async getStats(): Promise<ArchiveStats> {
    const url = `${this.baseUrl}/stats`;
    const response = await firstValueFrom(this.http.get<any>(url));
    return response.stats || {};
  }

  /**
   * Récupère l'activité récente d'archivage
   */
  async getRecentActivity(limit: number = 20): Promise<ArchivedEntity[]> {
    const url = `${this.baseUrl}/activity`;
    const params = new HttpParams().set('limit', limit.toString());
    
    const response = await firstValueFrom(this.http.get<any>(url, { params }));
    return response.activity || [];
  }

  /**
   * Effectue un nettoyage des entités anciennes
   */
  async cleanup(daysOld: number = 365, modelName?: string): Promise<CleanupResult> {
    const url = modelName ? 
      `${this.baseUrl}/${modelName}/cleanup` : 
      `${this.baseUrl}/cleanup`;
    
    const params = new HttpParams().set('daysOld', daysOld.toString());
    
    const response = await firstValueFrom(this.http.post<any>(url, {}, { params }));
    return response.results || {};
  }

  // Méthodes spécifiques pour les évaluations (compatibilité avec l'existant)
  
  /**
   * Archive une évaluation
   */
  async archiveEvaluation(evaluationId: string): Promise<any> {
    const url = `${environment.apiUrl}/evaluations/${evaluationId}/archive`;
    return firstValueFrom(this.http.post(url, {}));
  }

  /**
   * Restaure une évaluation archivée
   */
  async restoreEvaluation(evaluationId: string): Promise<any> {
    const url = `${environment.apiUrl}/evaluations/${evaluationId}/restore`;
    return firstValueFrom(this.http.post(url, {}));
  }

  /**
   * Récupère les évaluations archivées
   */
  async getArchivedEvaluations(): Promise<any[]> {
    const url = `${environment.apiUrl}/evaluations/archived`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  /**
   * Supprime définitivement une évaluation archivée
   */
  async permanentDeleteEvaluation(evaluationId: string): Promise<any> {
    const url = `${environment.apiUrl}/evaluations/${evaluationId}/permanent`;
    return firstValueFrom(this.http.delete(url));
  }

  // Méthodes utilitaires

  /**
   * Vérifie si une entité peut être archivée
   */
  async canArchive(modelName: string, entityId: string): Promise<boolean> {
    try {
      // Tentative d'archivage en mode dry-run (si implémenté côté backend)
      // Pour l'instant, on assume que c'est possible
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère les détails d'une entité archivée
   */
  async getArchivedEntityDetails(modelName: string, entityId: string): Promise<any> {
    const entities = await this.getArchivedEntities(modelName);
    return entities.find(entity => entity.id === entityId);
  }

  /**
   * Recherche dans les entités archivées
   */
  async searchArchivedEntities(
    modelName: string, 
    searchTerm: string, 
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      archivedBy?: string;
    }
  ): Promise<any[]> {
    const entities = await this.getArchivedEntities(modelName);
    
    return entities.filter(entity => {
      // Recherche textuelle
      const matchesSearch = !searchTerm || 
        (entity.titre || entity.nom || entity.enonce || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par date
      const matchesDateFrom = !filters?.dateFrom || 
        new Date(entity.dateArchivage) >= new Date(filters.dateFrom);
      
      const matchesDateTo = !filters?.dateTo || 
        new Date(entity.dateArchivage) <= new Date(filters.dateTo);
      
      // Filtre par utilisateur
      const matchesUser = !filters?.archivedBy || 
        (entity.ArchivedByUser && 
         `${entity.ArchivedByUser.prenom} ${entity.ArchivedByUser.nom}`.toLowerCase().includes(filters.archivedBy.toLowerCase()));
      
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesUser;
    });
  }

  /**
   * Exporte les données d'archivage
   */
  async exportArchiveData(modelName?: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const stats = await this.getStats();
    const activity = await this.getRecentActivity(100);
    
    const data = {
      stats,
      activity,
      exportDate: new Date().toISOString(),
      modelName
    };

    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      // Conversion CSV simplifiée
      const csv = this.convertToCSV(activity);
      return new Blob([csv], { type: 'text/csv' });
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}