import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CacheService, CacheConfig } from './cache.service';
import { User } from '../domain/entities/user.entity';
import { UserUseCase } from '../usecases/user.usecase';

export interface UserCacheConfig extends CacheConfig {
  autoRefresh?: boolean; // Actualisation automatique (défaut: false)
  refreshInterval?: number; // Intervalle d'actualisation en ms (défaut: 10 minutes)
}

@Injectable({
  providedIn: 'root'
})
export class UserCacheService {
  private cacheService = inject(CacheService);
  private userUseCase = inject(UserUseCase);
  
  // Clés de cache
  private readonly CACHE_KEYS = {
    ALL_USERS: 'users_all',
    ADMINS: 'users_admins',
    TEACHERS: 'users_teachers',
    STUDENTS: 'users_students',
    USER_BY_ID: (id: string) => `user_${id}`,
    USER_STATS: 'user_stats'
  };

  // Configuration par défaut pour les utilisateurs
  private readonly defaultUserConfig: UserCacheConfig = {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 50,
    persistToStorage: true,
    autoRefresh: false,
    refreshInterval: 10 * 60 * 1000 // 10 minutes
  };

  // Subjects pour les données en temps réel
  private usersSubject = new BehaviorSubject<User[]>([]);
  private adminsSubject = new BehaviorSubject<User[]>([]);
  private teachersSubject = new BehaviorSubject<User[]>([]);
  private studentsSubject = new BehaviorSubject<User[]>([]);

  constructor() {
    this.initializeCache();
  }

  /**
   * Récupère tous les utilisateurs avec cache
   */
  getAllUsers(config?: UserCacheConfig): Observable<User[]> {
    const finalConfig = { ...this.defaultUserConfig, ...config };
    
    return this.cacheService.getOrFetch(
      this.CACHE_KEYS.ALL_USERS,
      () => this.userUseCase.getAllUsers(),
      finalConfig
    ).pipe(
      tap(users => {
        this.usersSubject.next(users);
        this.updateRoleBasedCache(users);
      })
    );
  }

  /**
   * Récupère les administrateurs avec cache
   */
  getAdmins(config?: UserCacheConfig): Observable<User[]> {
    const finalConfig = { ...this.defaultUserConfig, ...config };
    
    return this.cacheService.getOrFetch(
      this.CACHE_KEYS.ADMINS,
      () => this.getAllUsers().pipe(
        map(users => users.filter(u => u.role === 'ADMIN'))
      ),
      finalConfig
    ).pipe(
      tap(admins => this.adminsSubject.next(admins))
    );
  }

  /**
   * Récupère les enseignants avec cache
   */
  getTeachers(config?: UserCacheConfig): Observable<User[]> {
    const finalConfig = { ...this.defaultUserConfig, ...config };
    
    return this.cacheService.getOrFetch(
      this.CACHE_KEYS.TEACHERS,
      () => this.getAllUsers().pipe(
        map(users => users.filter(u => u.role === 'ENSEIGNANT'))
      ),
      finalConfig
    ).pipe(
      tap(teachers => this.teachersSubject.next(teachers))
    );
  }

  /**
   * Récupère les étudiants avec cache
   */
  getStudents(config?: UserCacheConfig): Observable<User[]> {
    const finalConfig = { ...this.defaultUserConfig, ...config };
    
    return this.cacheService.getOrFetch(
      this.CACHE_KEYS.STUDENTS,
      () => this.getAllUsers().pipe(
        map(users => users.filter(u => u.role === 'ETUDIANT'))
      ),
      finalConfig
    ).pipe(
      tap(students => this.studentsSubject.next(students))
    );
  }

  /**
   * Récupère un utilisateur par ID avec cache
   */
  getUserById(id: string, config?: UserCacheConfig): Observable<User | null> {
    const finalConfig = { ...this.defaultUserConfig, ...config };
    
    return this.cacheService.getOrFetch(
      this.CACHE_KEYS.USER_BY_ID(id),
      () => this.userUseCase.getUserById(id),
      finalConfig
    );
  }

  /**
   * Observe les changements des utilisateurs en temps réel
   */
  observeUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  /**
   * Observe les changements des administrateurs en temps réel
   */
  observeAdmins(): Observable<User[]> {
    return this.adminsSubject.asObservable();
  }

  /**
   * Observe les changements des enseignants en temps réel
   */
  observeTeachers(): Observable<User[]> {
    return this.teachersSubject.asObservable();
  }

  /**
   * Observe les changements des étudiants en temps réel
   */
  observeStudents(): Observable<User[]> {
    return this.studentsSubject.asObservable();
  }

  /**
   * Invalide le cache d'un utilisateur spécifique
   */
  invalidateUser(userId: string): void {
    this.cacheService.delete(this.CACHE_KEYS.USER_BY_ID(userId));
    this.refreshAllUsers();
  }

  /**
   * Invalide tout le cache des utilisateurs
   */
  invalidateAllUsers(): void {
    Object.values(this.CACHE_KEYS).forEach(key => {
      if (typeof key === 'string') {
        this.cacheService.delete(key);
      }
    });
    
    // Invalider aussi les utilisateurs individuels
    this.cacheService.invalidateByPattern('^user_');
  }

  /**
   * Actualise les données des utilisateurs
   */
  refreshAllUsers(): void {
    this.invalidateAllUsers();
    this.getAllUsers().subscribe();
  }

  /**
   * Actualise les données d'un rôle spécifique
   */
  refreshByRole(role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT'): void {
    switch (role) {
      case 'ADMIN':
        this.cacheService.delete(this.CACHE_KEYS.ADMINS);
        this.getAdmins().subscribe();
        break;
      case 'ENSEIGNANT':
        this.cacheService.delete(this.CACHE_KEYS.TEACHERS);
        this.getTeachers().subscribe();
        break;
      case 'ETUDIANT':
        this.cacheService.delete(this.CACHE_KEYS.STUDENTS);
        this.getStudents().subscribe();
        break;
    }
  }

  /**
   * Met à jour le cache après une opération CRUD
   */
  updateCacheAfterOperation(operation: 'create' | 'update' | 'delete', user?: User): void {
    switch (operation) {
      case 'create':
        if (user) {
          // Ajouter l'utilisateur au cache approprié
          this.addUserToCache(user);
        }
        this.refreshAllUsers();
        break;
        
      case 'update':
        if (user) {
          // Mettre à jour l'utilisateur dans le cache
          this.updateUserInCache(user);
        }
        this.refreshAllUsers();
        break;
        
      case 'delete':
        if (user) {
          // Supprimer l'utilisateur du cache
          this.removeUserFromCache(user);
        }
        this.refreshAllUsers();
        break;
    }
  }

  /**
   * Obtient les statistiques du cache des utilisateurs
   */
  getCacheStats(): {
    totalUsers: number;
    admins: number;
    teachers: number;
    students: number;
    cacheHitRate: number;
    memoryUsage: number;
  } {
    const allUsers = this.cacheService.get<User[]>(this.CACHE_KEYS.ALL_USERS) || [];
    const admins = this.cacheService.get<User[]>(this.CACHE_KEYS.ADMINS) || [];
    const teachers = this.cacheService.get<User[]>(this.CACHE_KEYS.TEACHERS) || [];
    const students = this.cacheService.get<User[]>(this.CACHE_KEYS.STUDENTS) || [];
    
    const cacheStats = this.cacheService.getStats();
    
    return {
      totalUsers: allUsers.length,
      admins: admins.length,
      teachers: teachers.length,
      students: students.length,
      cacheHitRate: this.calculateHitRate(),
      memoryUsage: cacheStats.totalMemoryUsage
    };
  }

  /**
   * Précharge les données essentielles
   */
  preloadEssentialData(): void {
    this.getAllUsers().subscribe();
  }

  private initializeCache(): void {
    // Charger les données existantes du cache
    const cachedUsers = this.cacheService.get<User[]>(this.CACHE_KEYS.ALL_USERS);
    if (cachedUsers) {
      this.usersSubject.next(cachedUsers);
      this.updateRoleBasedCache(cachedUsers);
    }
  }

  private updateRoleBasedCache(users: User[]): void {
    const admins = users.filter(u => u.role === 'ADMIN');
    const teachers = users.filter(u => u.role === 'ENSEIGNANT');
    const students = users.filter(u => u.role === 'ETUDIANT');

    this.cacheService.set(this.CACHE_KEYS.ADMINS, admins, this.defaultUserConfig);
    this.cacheService.set(this.CACHE_KEYS.TEACHERS, teachers, this.defaultUserConfig);
    this.cacheService.set(this.CACHE_KEYS.STUDENTS, students, this.defaultUserConfig);

    this.adminsSubject.next(admins);
    this.teachersSubject.next(teachers);
    this.studentsSubject.next(students);
  }

  private addUserToCache(user: User): void {
    const allUsers = this.cacheService.get<User[]>(this.CACHE_KEYS.ALL_USERS) || [];
    const updatedUsers = [...allUsers, user];
    
    this.cacheService.set(this.CACHE_KEYS.ALL_USERS, updatedUsers, this.defaultUserConfig);
    this.cacheService.set(this.CACHE_KEYS.USER_BY_ID(user.id.toString()), user, this.defaultUserConfig);
    
    this.updateRoleBasedCache(updatedUsers);
  }

  private updateUserInCache(user: User): void {
    const allUsers = this.cacheService.get<User[]>(this.CACHE_KEYS.ALL_USERS) || [];
    const updatedUsers = allUsers.map(u => u.id === user.id ? user : u);
    
    this.cacheService.set(this.CACHE_KEYS.ALL_USERS, updatedUsers, this.defaultUserConfig);
    this.cacheService.set(this.CACHE_KEYS.USER_BY_ID(user.id.toString()), user, this.defaultUserConfig);
    
    this.updateRoleBasedCache(updatedUsers);
  }

  private removeUserFromCache(user: User): void {
    const allUsers = this.cacheService.get<User[]>(this.CACHE_KEYS.ALL_USERS) || [];
    const updatedUsers = allUsers.filter(u => u.id !== user.id);
    
    this.cacheService.set(this.CACHE_KEYS.ALL_USERS, updatedUsers, this.defaultUserConfig);
    this.cacheService.delete(this.CACHE_KEYS.USER_BY_ID(user.id.toString()));
    
    this.updateRoleBasedCache(updatedUsers);
  }

  private calculateHitRate(): number {
    // Implémentation simplifiée du taux de succès du cache
    // Dans une vraie application, vous pourriez tracker les hits/misses
    return 0.85; // 85% par défaut
  }
}