# Guide d'Intégration du Cache Local

## Vue d'ensemble

Le système de cache local a été intégré dans l'application Angular pour améliorer les performances et réduire les appels API. Il comprend deux services principaux :

1. **CacheService** - Service générique de gestion du cache
2. **UserCacheService** - Service spécialisé pour la gestion du cache des utilisateurs

## Architecture

```
┌─────────────────────┐
│   Components        │
│  (Users, Students)  │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  UserCacheService   │
│  - Gestion métier   │
│  - Observables      │
│  - Invalidation     │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│   CacheService      │
│  - Stockage local   │
│  - TTL/Expiration   │
│  - Persistance      │
└─────────────────────┘
```

## Services Créés

### 1. CacheService (`core/services/cache.service.ts`)

Service générique qui gère :
- **Stockage en mémoire** avec Map<string, CacheItem>
- **Persistance** dans localStorage
- **TTL (Time To Live)** configurable
- **Nettoyage automatique** des entrées expirées
- **Observables** pour les changements en temps réel

#### Méthodes principales :
```typescript
// Stocker une donnée
set<T>(key: string, data: T, config?: CacheConfig): void

// Récupérer une donnée
get<T>(key: string): T | null

// Récupérer ou exécuter une fonction
getOrFetch<T>(key: string, fetchFn: () => Observable<T>, config?: CacheConfig): Observable<T>

// Observer les changements
observe<T>(key: string): Observable<T | null>

// Invalider le cache
delete(key: string): void
invalidateByPattern(pattern: string): void
clear(): void
```

### 2. UserCacheService (`core/services/user-cache.service.ts`)

Service spécialisé qui gère :
- **Cache par rôle** (Admins, Enseignants, Étudiants)
- **Observables temps réel** pour chaque type d'utilisateur
- **Invalidation intelligente** après les opérations CRUD
- **Statistiques** du cache

#### Méthodes principales :
```typescript
// Récupérer par rôle avec cache
getAdmins(config?: UserCacheConfig): Observable<User[]>
getTeachers(config?: UserCacheConfig): Observable<User[]>
getStudents(config?: UserCacheConfig): Observable<User[]>

// Observer les changements
observeAdmins(): Observable<User[]>
observeTeachers(): Observable<User[]>
observeStudents(): Observable<User[]>

// Gestion du cache après opérations
updateCacheAfterOperation(operation: 'create' | 'update' | 'delete', user?: User): void

// Actualisation
refreshByRole(role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT'): void
```

## Intégration dans les Composants

### Exemple : UsersComponent

```typescript
export class UsersComponent implements OnInit, OnDestroy {
  // Injection des services
  private userCacheService = inject(UserCacheService);
  private cacheService = inject(CacheService);
  
  // Signaux pour la gestion du cache
  cacheEnabled = signal(true);
  lastRefresh = signal<Date | null>(null);
  
  // Subject pour le nettoyage
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUsers();
    this.setupCacheObservation();
  }

  // Observer les changements en temps réel
  setupCacheObservation(): void {
    this.userCacheService.observeAdmins()
      .pipe(takeUntil(this.destroy$))
      .subscribe(admins => {
        this.users.set(admins);
        this.applyFilters();
        this.lastRefresh.set(new Date());
      });
  }

  // Charger avec cache
  loadUsers(): void {
    if (this.cacheEnabled()) {
      this.userCacheService.getAdmins({
        ttl: 5 * 60 * 1000, // 5 minutes
        persistToStorage: true
      }).subscribe({
        next: (admins) => {
          this.users.set(admins);
          this.applyFilters();
          this.lastRefresh.set(new Date());
        },
        error: () => this.loadUsersDirectly() // Fallback
      });
    } else {
      this.loadUsersDirectly();
    }
  }

  // Mettre à jour le cache après opérations
  createUser(): void {
    this.userUseCase.createUser(data).subscribe({
      next: (newUser) => {
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('create', newUser);
        } else {
          this.loadUsers();
        }
      }
    });
  }
}
```

## Interface Utilisateur

### Contrôles de Cache

Chaque composant dispose de contrôles pour :
- **Activer/Désactiver** le cache
- **Actualiser** manuellement les données
- **Vider** le cache
- **Voir les statistiques** (taille, taux de succès, etc.)

### Indicateurs Visuels

- **Badge de statut** : Actuel / Expiré / Désactivé
- **Dernière actualisation** : Horodatage
- **Statistiques** : Mémoire utilisée, nombre d'entrées

## Configuration

### TTL par Type de Données

```typescript
const cacheConfig = {
  users: 10 * 60 * 1000,      // 10 minutes
  classes: 30 * 60 * 1000,    // 30 minutes
  evaluations: 5 * 60 * 1000  // 5 minutes
};
```

### Persistance

```typescript
const config: CacheConfig = {
  ttl: 10 * 60 * 1000,        // 10 minutes
  maxSize: 100,               // 100 entrées max
  persistToStorage: true      // Sauvegarder dans localStorage
};
```

## Intercepteur HTTP (Optionnel)

L'intercepteur `CacheInterceptor` peut automatiquement mettre en cache les requêtes GET :

```typescript
// Dans app.config.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CacheInterceptor,
    multi: true
  }
]
```

## Composant de Gestion Globale

Le `CacheManagerComponent` fournit :
- **Vue d'ensemble** de tous les caches
- **Statistiques détaillées** par type
- **Gestion centralisée** (vider, nettoyer, etc.)
- **Liste des entrées** avec métadonnées

## Bonnes Pratiques

### 1. Gestion de la Mémoire
```typescript
// Toujours nettoyer les observables
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. Fallback en Cas d'Erreur
```typescript
loadUsers(): void {
  this.userCacheService.getAdmins().subscribe({
    next: (data) => this.handleSuccess(data),
    error: () => this.loadUsersDirectly() // Fallback vers API
  });
}
```

### 3. Invalidation Intelligente
```typescript
// Après création/modification/suppression
this.userCacheService.updateCacheAfterOperation('create', newUser);
```

### 4. Configuration Adaptée
```typescript
// TTL plus court pour les données critiques
const criticalDataConfig = {
  ttl: 2 * 60 * 1000, // 2 minutes
  persistToStorage: false // Pas de persistance
};
```

## Avantages

1. **Performance** : Réduction des appels API
2. **Expérience utilisateur** : Chargement instantané des données mises en cache
3. **Résilience** : Fonctionnement hors ligne avec les données en cache
4. **Flexibilité** : Configuration par type de données
5. **Observabilité** : Statistiques et monitoring du cache

## Surveillance et Debug

### Logs de Cache
```typescript
// Activer les logs en développement
if (environment.production === false) {
  console.log('Cache hit for key:', key);
  console.log('Cache stats:', this.cacheService.getStats());
}
```

### Métriques
- Taux de succès du cache
- Taille mémoire utilisée
- Nombre d'entrées par type
- Fréquence d'invalidation

## Migration et Déploiement

1. **Phase 1** : Déployer les services de cache
2. **Phase 2** : Intégrer dans les composants existants
3. **Phase 3** : Ajouter l'intercepteur HTTP
4. **Phase 4** : Optimiser les configurations TTL

Le système est conçu pour être **non-intrusif** et peut être activé/désactivé par composant selon les besoins.