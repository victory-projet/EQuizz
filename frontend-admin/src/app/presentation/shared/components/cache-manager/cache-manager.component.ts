import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CacheService } from '../../../../core/services/cache.service';
import { UserCacheService } from '../../../../core/services/user-cache.service';

interface CacheEntry {
  key: string;
  size: number;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  type: 'user' | 'http' | 'other';
}

@Component({
  selector: 'app-cache-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cache-manager">
      <div class="cache-header">
        <h3>Gestionnaire de Cache</h3>
        <div class="cache-actions">
          <button class="btn btn-secondary" (click)="refreshStats()">
            <span class="material-icons">refresh</span>
            Actualiser
          </button>
          <button class="btn btn-warning" (click)="clearExpiredCache()">
            <span class="material-icons">cleaning_services</span>
            Nettoyer
          </button>
          <button class="btn btn-danger" (click)="clearAllCache()">
            <span class="material-icons">delete_sweep</span>
            Tout vider
          </button>
        </div>
      </div>

      <!-- Statistiques globales -->
      <div class="cache-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">storage</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ cacheStats().size }}</div>
            <div class="stat-label">Entrées en cache</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">memory</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatMemorySize(cacheStats().totalMemoryUsage) }}</div>
            <div class="stat-label">Mémoire utilisée</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">trending_up</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatHitRate(hitRate()) }}</div>
            <div class="stat-label">Taux de succès</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">schedule</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ expiredEntries().length }}</div>
            <div class="stat-label">Entrées expirées</div>
          </div>
        </div>
      </div>

      <!-- Détails par type de cache -->
      <div class="cache-details">
        <div class="cache-section">
          <h4>Cache des Utilisateurs</h4>
          <div class="cache-type-stats">
            <div class="type-stat">
              <span>Total:</span>
              <span>{{ userCacheStats().totalUsers }}</span>
            </div>
            <div class="type-stat">
              <span>Administrateurs:</span>
              <span>{{ userCacheStats().admins }}</span>
            </div>
            <div class="type-stat">
              <span>Enseignants:</span>
              <span>{{ userCacheStats().teachers }}</span>
            </div>
            <div class="type-stat">
              <span>Étudiants:</span>
              <span>{{ userCacheStats().students }}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" (click)="clearUserCache()">
            Vider le cache utilisateurs
          </button>
        </div>

        <div class="cache-section">
          <h4>Cache HTTP</h4>
          <div class="cache-type-stats">
            <div class="type-stat">
              <span>Requêtes en cache:</span>
              <span>{{ httpCacheEntries().length }}</span>
            </div>
            <div class="type-stat">
              <span>Taille moyenne:</span>
              <span>{{ formatMemorySize(averageHttpCacheSize()) }}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" (click)="clearHttpCache()">
            Vider le cache HTTP
          </button>
        </div>
      </div>

      <!-- Liste des entrées de cache -->
      <div class="cache-entries">
        <h4>Entrées de Cache ({{ filteredEntries().length }})</h4>
        
        <div class="cache-filters">
          <select [(ngModel)]="selectedFilter" (change)="applyFilter()">
            <option value="all">Toutes les entrées</option>
            <option value="user">Cache utilisateurs</option>
            <option value="http">Cache HTTP</option>
            <option value="expired">Entrées expirées</option>
          </select>
        </div>

        <div class="entries-list">
          @for (entry of filteredEntries(); track entry.key) {
            <div class="cache-entry" [class.expired]="entry.isExpired">
              <div class="entry-info">
                <div class="entry-key">{{ entry.key }}</div>
                <div class="entry-meta">
                  <span class="entry-type" [class]="'type-' + entry.type">{{ entry.type }}</span>
                  <span class="entry-size">{{ formatMemorySize(entry.size) }}</span>
                  <span class="entry-date">{{ entry.createdAt.toLocaleString() }}</span>
                  @if (entry.isExpired) {
                    <span class="entry-expired">Expiré</span>
                  } @else {
                    <span class="entry-expires">Expire: {{ entry.expiresAt.toLocaleString() }}</span>
                  }
                </div>
              </div>
              <div class="entry-actions">
                <button class="btn-icon" (click)="deleteEntry(entry.key)" title="Supprimer">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <span class="material-icons">inbox</span>
              <p>Aucune entrée de cache trouvée</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cache-manager.component.scss']
})
export class CacheManagerComponent implements OnInit {
  private cacheService = inject(CacheService);
  private userCacheService = inject(UserCacheService);

  cacheStats = signal<any>({ size: 0, keys: [], totalMemoryUsage: 0 });
  userCacheStats = signal<any>({ totalUsers: 0, admins: 0, teachers: 0, students: 0 });
  hitRate = signal(0);
  cacheEntries = signal<CacheEntry[]>([]);
  filteredEntries = signal<CacheEntry[]>([]);
  expiredEntries = signal<CacheEntry[]>([]);
  httpCacheEntries = signal<CacheEntry[]>([]);
  
  selectedFilter = 'all';

  ngOnInit(): void {
    this.refreshStats();
  }

  refreshStats(): void {
    // Statistiques générales du cache
    const stats = this.cacheService.getStats();
    this.cacheStats.set(stats);

    // Statistiques du cache utilisateurs
    const userStats = this.userCacheService.getCacheStats();
    this.userCacheStats.set(userStats);
    this.hitRate.set(userStats.cacheHitRate);

    // Analyser les entrées de cache
    this.analyzeCacheEntries();
  }

  private analyzeCacheEntries(): void {
    const stats = this.cacheStats();
    const entries: CacheEntry[] = [];
    const now = new Date();

    stats.keys.forEach((key: string) => {
      // Simuler la récupération des métadonnées de cache
      // Dans une vraie implémentation, ces données viendraient du service de cache
      const entry: CacheEntry = {
        key,
        size: this.estimateEntrySize(key),
        createdAt: new Date(now.getTime() - Math.random() * 3600000), // Dernière heure
        expiresAt: new Date(now.getTime() + Math.random() * 3600000), // Prochaine heure
        isExpired: Math.random() > 0.8, // 20% d'entrées expirées
        type: this.determineEntryType(key)
      };
      entries.push(entry);
    });

    this.cacheEntries.set(entries);
    this.expiredEntries.set(entries.filter(e => e.isExpired));
    this.httpCacheEntries.set(entries.filter(e => e.type === 'http'));
    this.applyFilter();
  }

  private estimateEntrySize(key: string): number {
    // Estimation basique de la taille
    if (key.includes('users')) return 1024 * 5; // 5KB pour les utilisateurs
    if (key.includes('http')) return 1024 * 2; // 2KB pour les requêtes HTTP
    return 1024; // 1KB par défaut
  }

  private determineEntryType(key: string): 'user' | 'http' | 'other' {
    if (key.includes('user')) return 'user';
    if (key.includes('http')) return 'http';
    return 'other';
  }

  applyFilter(): void {
    const entries = this.cacheEntries();
    let filtered = entries;

    switch (this.selectedFilter) {
      case 'user':
        filtered = entries.filter(e => e.type === 'user');
        break;
      case 'http':
        filtered = entries.filter(e => e.type === 'http');
        break;
      case 'expired':
        filtered = entries.filter(e => e.isExpired);
        break;
      default:
        filtered = entries;
    }

    this.filteredEntries.set(filtered);
  }

  clearAllCache(): void {
    if (confirm('Êtes-vous sûr de vouloir vider tout le cache ?')) {
      this.cacheService.clear();
      this.refreshStats();
    }
  }

  clearExpiredCache(): void {
    this.cacheService.invalidateExpired();
    this.refreshStats();
  }

  clearUserCache(): void {
    this.userCacheService.invalidateAllUsers();
    this.refreshStats();
  }

  clearHttpCache(): void {
    this.cacheService.invalidateByPattern('^http_');
    this.refreshStats();
  }

  deleteEntry(key: string): void {
    this.cacheService.delete(key);
    this.refreshStats();
  }

  averageHttpCacheSize(): number {
    const httpEntries = this.httpCacheEntries();
    if (httpEntries.length === 0) return 0;
    
    const totalSize = httpEntries.reduce((sum, entry) => sum + entry.size, 0);
    return totalSize / httpEntries.length;
  }

  formatMemorySize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatHitRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }
}