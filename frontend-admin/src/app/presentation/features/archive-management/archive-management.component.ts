import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchiveService } from '../../../core/services/archive.service';
import { NotificationService } from '../../../core/services/notification.service';

interface ArchivedEntity {
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

interface ArchiveStats {
  [key: string]: {
    total: number;
    active: number;
    archived: number;
    archiveRate: number;
  };
}

@Component({
  selector: 'app-archive-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive-management.component.html',
  styleUrls: ['./archive-management.component.scss']
})
export class ArchiveManagementComponent implements OnInit {
  activeTab: 'overview' | 'evaluations' | 'questions' | 'cours' | 'etudiants' | 'classes' = 'overview';
  
  stats: ArchiveStats = {};
  recentActivity: ArchivedEntity[] = [];
  
  // Données par type d'entité
  archivedEvaluations: any[] = [];
  archivedQuestions: any[] = [];
  archivedCours: any[] = [];
  archivedEtudiants: any[] = [];
  archivedClasses: any[] = [];
  
  loading = false;
  selectedEntities: Set<string> = new Set();
  
  // Filtres
  searchTerm = '';
  dateFilter = '';
  userFilter = '';

  constructor(
    private archiveService: ArchiveService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOverviewData();
  }

  async loadOverviewData(): Promise<void> {
    this.loading = true;
    try {
      // Charger les statistiques
      this.stats = await this.archiveService.getStats();
      
      // Charger l'activité récente
      this.recentActivity = await this.archiveService.getRecentActivity();
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'aperçu:', error);
      this.notificationService.showError('Erreur lors du chargement des données');
    } finally {
      this.loading = false;
    }
  }

  async loadArchivedEntities(type: string): Promise<void> {
    this.loading = true;
    try {
      const entities = await this.archiveService.getArchivedEntities(type);
      
      switch (type) {
        case 'Evaluation':
          this.archivedEvaluations = entities;
          break;
        case 'Question':
          this.archivedQuestions = entities;
          break;
        case 'Cours':
          this.archivedCours = entities;
          break;
        case 'Etudiant':
          this.archivedEtudiants = entities;
          break;
        case 'Classe':
          this.archivedClasses = entities;
          break;
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ${type} archivés:`, error);
      this.notificationService.showError(`Erreur lors du chargement des ${type} archivés`);
    } finally {
      this.loading = false;
    }
  }

  async restoreEntity(type: string, entityId: string): Promise<void> {
    try {
      await this.archiveService.restoreEntity(type, entityId);
      this.notificationService.showSuccess(`${type} restauré(e) avec succès`);
      
      // Recharger les données
      await this.loadArchivedEntities(type);
      await this.loadOverviewData();
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      this.notificationService.showError('Erreur lors de la restauration');
    }
  }

  async permanentDelete(type: string, entityId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet élément ? Cette action est irréversible.')) {
      return;
    }

    try {
      await this.archiveService.permanentDelete(type, entityId);
      this.notificationService.showSuccess(`${type} supprimé(e) définitivement`);
      
      // Recharger les données
      await this.loadArchivedEntities(type);
      await this.loadOverviewData();
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error);
      this.notificationService.showError('Erreur lors de la suppression définitive');
    }
  }

  async bulkRestore(): Promise<void> {
    if (this.selectedEntities.size === 0) {
      this.notificationService.showWarning('Aucun élément sélectionné');
      return;
    }

    try {
      const promises = Array.from(this.selectedEntities).map(entityKey => {
        const [type, id] = entityKey.split(':');
        return this.archiveService.restoreEntity(type, id);
      });

      await Promise.all(promises);
      this.notificationService.showSuccess(`${this.selectedEntities.size} élément(s) restauré(s)`);
      
      this.selectedEntities.clear();
      await this.loadArchivedEntities(this.activeTab);
      await this.loadOverviewData();
    } catch (error) {
      console.error('Erreur lors de la restauration en lot:', error);
      this.notificationService.showError('Erreur lors de la restauration en lot');
    }
  }

  async bulkPermanentDelete(): Promise<void> {
    if (this.selectedEntities.size === 0) {
      this.notificationService.showWarning('Aucun élément sélectionné');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${this.selectedEntities.size} élément(s) ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const promises = Array.from(this.selectedEntities).map(entityKey => {
        const [type, id] = entityKey.split(':');
        return this.archiveService.permanentDelete(type, id);
      });

      await Promise.all(promises);
      this.notificationService.showSuccess(`${this.selectedEntities.size} élément(s) supprimé(s) définitivement`);
      
      this.selectedEntities.clear();
      await this.loadArchivedEntities(this.activeTab);
      await this.loadOverviewData();
    } catch (error) {
      console.error('Erreur lors de la suppression définitive en lot:', error);
      this.notificationService.showError('Erreur lors de la suppression définitive en lot');
    }
  }

  async cleanup(daysOld: number = 365): Promise<void> {
    if (!confirm(`Supprimer définitivement tous les éléments archivés depuis plus de ${daysOld} jours ?`)) {
      return;
    }

    try {
      const results = await this.archiveService.cleanup(daysOld);
      
      let message = 'Nettoyage effectué:\n';
      Object.entries(results).forEach(([type, result]: [string, any]) => {
        message += `${type}: ${result.deleted}/${result.found} supprimés\n`;
      });
      
      this.notificationService.showSuccess(message);
      await this.loadOverviewData();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      this.notificationService.showError('Erreur lors du nettoyage');
    }
  }

  onTabChange(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.selectedEntities.clear();
    
    if (tab !== 'overview') {
      this.loadArchivedEntities(tab.charAt(0).toUpperCase() + tab.slice(1));
    }
  }

  toggleEntitySelection(type: string, entityId: string): void {
    const key = `${type}:${entityId}`;
    if (this.selectedEntities.has(key)) {
      this.selectedEntities.delete(key);
    } else {
      this.selectedEntities.add(key);
    }
  }

  isEntitySelected(type: string, entityId: string): boolean {
    return this.selectedEntities.has(`${type}:${entityId}`);
  }

  selectAll(entities: any[], type: string): void {
    entities.forEach(entity => {
      this.selectedEntities.add(`${type}:${entity.id}`);
    });
  }

  deselectAll(): void {
    this.selectedEntities.clear();
  }

  getFilteredEntities(entities: any[]): any[] {
    if (!this.searchTerm && !this.dateFilter && !this.userFilter) {
      return entities;
    }

    return entities.filter(entity => {
      const matchesSearch = !this.searchTerm || 
        (entity.titre || entity.nom || entity.enonce || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDate = !this.dateFilter || 
        new Date(entity.dateArchivage).toDateString() === new Date(this.dateFilter).toDateString();
      
      const matchesUser = !this.userFilter || 
        (entity.ArchivedByUser && 
         `${entity.ArchivedByUser.prenom} ${entity.ArchivedByUser.nom}`.toLowerCase().includes(this.userFilter.toLowerCase()));
      
      return matchesSearch && matchesDate && matchesUser;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEntityTitle(entity: any): string {
    return entity.titre || entity.nom || entity.enonce || `ID: ${entity.id}`;
  }

  getStatsKeys(): string[] {
    return Object.keys(this.stats);
  }
}