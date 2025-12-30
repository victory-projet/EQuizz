import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { User } from '../../../core/domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../core/domain/repositories/user.repository.interface';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { UserCacheService } from '../../../core/services/user-cache.service';
import { CacheService } from '../../../core/services/cache.service';
import { ExcelPreviewService, ExcelImportConfig, ExcelPreviewData } from '../../../core/services/excel-preview.service';
import { ExcelUploadComponent, ExcelUploadResult } from '../../shared/components/excel-upload/excel-upload.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelUploadComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showPasswordModal = signal(false);
  selectedUser = signal<User | null>(null);
  searchQuery = signal('');
  filterRole = signal<string>('ALL');
  
  // Cache management
  cacheEnabled = signal(true);
  cacheStats = signal<any>(null);
  lastRefresh = signal<Date | null>(null);
  
  // Excel import
  showImportDialog = signal(false);
  showImportMenu = signal(false);
  importConfig = signal<ExcelImportConfig | null>(null);
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalPages = signal(1);

  // Destruction subject for cleanup
  private destroy$ = new Subject<void>();

  formData = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'ADMIN' as 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT',
    specialite: '',
    matricule: '',
    generatePassword: false
  };

  passwordData = {
    nouveauMotDePasse: '',
    confirmMotDePasse: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  private confirmationService = inject(ConfirmationService);
  private userCacheService = inject(UserCacheService);
  private cacheService = inject(CacheService);
  private excelPreviewService = inject(ExcelPreviewService);

  constructor(private userUseCase: UserUseCase) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupCacheObservation();
    this.updateCacheStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupCacheObservation(): void {
    // Observer les changements des administrateurs en temps réel
    this.userCacheService.observeAdmins()
      .pipe(takeUntil(this.destroy$))
      .subscribe(admins => {
        this.users.set(admins);
        this.applyFilters();
        this.lastRefresh.set(new Date());
      });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    
    if (this.cacheEnabled()) {
      // Utiliser le cache service
      this.userCacheService.getAdmins({
        ttl: 5 * 60 * 1000, // 5 minutes
        persistToStorage: true
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (admins) => {
          this.users.set(admins);
          this.applyFilters();
          this.isLoading.set(false);
          this.lastRefresh.set(new Date());
          this.updateCacheStats();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.errorMessage.set('Erreur lors du chargement des utilisateurs');
          this.isLoading.set(false);
          // Fallback vers l'API directe
          this.loadUsersDirectly();
        }
      });
    } else {
      this.loadUsersDirectly();
    }
  }

  loadUsersDirectly(): void {
    this.userUseCase.getAllUsers().subscribe({
      next: (users) => {
        // Filtrer pour ne garder que les administrateurs
        const admins = users.filter(u => u.role === 'ADMIN');
        this.users.set(admins);
        this.applyFilters();
        this.isLoading.set(false);
        this.lastRefresh.set(new Date());
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.errorMessage.set('Erreur lors du chargement des utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.users();
    
    if (this.filterRole() !== 'ALL') {
      filtered = filtered.filter(u => u.role === this.filterRole());
    }
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(u => 
        u.nom.toLowerCase().includes(query) ||
        u.prenom.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.matricule && u.matricule.toLowerCase().includes(query))
      );
    }
    
    this.filteredUsers.set(filtered);
    this.currentPage.set(1);
    this.updatePagination();
  }

  updatePagination(): void {
    const filtered = this.filteredUsers();
    const total = Math.ceil(filtered.length / this.itemsPerPage());
    this.totalPages.set(total);
    
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    this.paginatedUsers.set(filtered.slice(start, end));
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePagination();
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage.set(items);
    this.currentPage.set(1);
    this.updatePagination();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterRole(role: string): void {
    this.filterRole.set(role);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedUser.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.formData = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      motDePasse: '',
      role: user.role,
      specialite: '',
      matricule: user.matricule || '',
      generatePassword: false
    };
    this.showModal.set(true);
  }

  openPasswordModal(user: User): void {
    this.selectedUser.set(user);
    this.passwordData = {
      nouveauMotDePasse: '',
      confirmMotDePasse: ''
    };
    this.showPasswordModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showPasswordModal.set(false);
    this.resetForm();
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      role: 'ADMIN',
      specialite: '',
      matricule: '',
      generatePassword: false
    };
  }

  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  onGeneratePassword(): void {
    this.formData.motDePasse = this.generateTemporaryPassword();
    this.formData.generatePassword = true;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (this.selectedUser()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    // Validation - Le mot de passe est requis pour les administrateurs
    if (!this.formData.motDePasse) {
      this.errorMessage.set('Le mot de passe est requis');
      return;
    }

    const data: CreateUserDto = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      motDePasse: this.formData.motDePasse,
      role: 'ADMIN'
    };

    this.isLoading.set(true);
    this.userUseCase.createUser(data).subscribe({
      next: (newUser) => {
        this.successMessage.set('Administrateur créé avec succès');
        this.closeModal();
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('create', newUser);
        } else {
          this.loadUsers();
        }
        
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateUser(): void {
    const user = this.selectedUser();
    if (!user) return;

    const data: UpdateUserDto = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      estActif: user.estActif
    };

    if (this.formData.role === 'ENSEIGNANT' && this.formData.specialite) {
      data.specialite = this.formData.specialite;
    }

    this.isLoading.set(true);
    this.userUseCase.updateUser(user.id.toString(), data).subscribe({
      next: (updatedUser) => {
        this.successMessage.set('Utilisateur mis à jour avec succès');
        this.closeModal();
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('update', updatedUser);
        } else {
          this.loadUsers();
        }
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`${user.prenom} ${user.nom}`);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.userUseCase.deleteUser(user.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Utilisateur supprimé avec succès');
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('delete', user);
        } else {
          this.loadUsers();
        }
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async toggleUserStatus(user: User): Promise<void> {
    const action = user.estActif ? 'désactiver' : 'activer';
    const confirmed = await this.confirmationService.confirm({
      title: `Confirmer ${action === 'désactiver' ? 'la désactivation' : 'l\'activation'}`,
      message: `Êtes-vous sûr de vouloir ${action} l'utilisateur "${user.prenom} ${user.nom}" ?`,
      confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
      cancelText: 'Annuler',
      type: action === 'désactiver' ? 'warning' : 'success',
      icon: action === 'désactiver' ? 'person_off' : 'person'
    });
    
    if (!confirmed) return;

    const data: UpdateUserDto = {
      estActif: !user.estActif
    };

    this.userUseCase.updateUser(user.id.toString(), data).subscribe({
      next: (updatedUser) => {
        this.successMessage.set(`Utilisateur ${data.estActif ? 'activé' : 'désactivé'} avec succès`);
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('update', updatedUser);
        } else {
          this.loadUsers();
        }
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification du statut');
      }
    });
  }

  async resetPassword(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Confirmer la réinitialisation',
      message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de "${user.prenom} ${user.nom}" ?`,
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      type: 'warning',
      icon: 'lock_reset'
    });
    
    if (!confirmed) return;

    if (this.passwordData.nouveauMotDePasse !== this.passwordData.confirmMotDePasse) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordData.nouveauMotDePasse.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.isLoading.set(true);
    this.userUseCase.resetPassword(user.id.toString(), this.passwordData.nouveauMotDePasse).subscribe({
      next: () => {
        this.successMessage.set('Mot de passe réinitialisé avec succès');
        this.closeModal();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la réinitialisation');
        this.isLoading.set(false);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'ENSEIGNANT': return 'badge-teacher';
      case 'ETUDIANT': return 'badge-student';
      default: return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'ENSEIGNANT': return 'Enseignant';
      case 'ETUDIANT': return 'Étudiant';
      default: return role;
    }
  }

  // === MÉTHODES DE GESTION DU CACHE ===

  /**
   * Active ou désactive le cache
   */
  toggleCache(): void {
    this.cacheEnabled.set(!this.cacheEnabled());
    if (this.cacheEnabled()) {
      this.loadUsers();
    } else {
      this.clearCache();
      this.loadUsersDirectly();
    }
  }

  /**
   * Actualise manuellement les données
   */
  refreshData(): void {
    if (this.cacheEnabled()) {
      this.userCacheService.refreshByRole('ADMIN');
    } else {
      this.loadUsersDirectly();
    }
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.userCacheService.invalidateAllUsers();
    this.cacheStats.set(null);
    this.lastRefresh.set(null);
    this.successMessage.set('Cache vidé avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  /**
   * Met à jour les statistiques du cache
   */
  updateCacheStats(): void {
    if (this.cacheEnabled()) {
      const stats = this.userCacheService.getCacheStats();
      this.cacheStats.set(stats);
    }
  }

  /**
   * Précharge les données essentielles
   */
  preloadData(): void {
    this.userCacheService.preloadEssentialData();
    this.successMessage.set('Données préchargées');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  /**
   * Formate la taille mémoire pour l'affichage
   */
  formatMemorySize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formate le taux de succès du cache
   */
  formatHitRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }

  /**
   * Vérifie si les données sont récentes
   */
  isDataFresh(): boolean {
    const lastRefresh = this.lastRefresh();
    if (!lastRefresh) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Considéré comme frais si moins de 5 minutes
  }

  /**
   * Obtient le statut du cache pour l'affichage
   */
  getCacheStatus(): string {
    if (!this.cacheEnabled()) return 'Désactivé';
    if (this.isDataFresh()) return 'Actuel';
    return 'Expiré';
  }

  /**
   * Obtient la classe CSS pour le statut du cache
   */
  getCacheStatusClass(): string {
    if (!this.cacheEnabled()) return 'cache-disabled';
    if (this.isDataFresh()) return 'cache-fresh';
    return 'cache-expired';
  }

  // === IMPORT EXCEL ===
  
  toggleImportMenu(): void {
    this.showImportMenu.set(!this.showImportMenu());
  }

  openImportDialog(): void {
    this.showImportMenu.set(false);
    // Configuration pour l'import d'utilisateurs
    this.importConfig.set(this.excelPreviewService.getUserImportConfig());
    this.showImportDialog.set(true);
  }

  closeImportDialog(): void {
    this.showImportDialog.set(false);
    this.importConfig.set(null);
  }

  exportUsers(): void {
    this.showImportMenu.set(false);
    // TODO: Implémenter l'export des utilisateurs
    console.log('Export des utilisateurs vers Excel');
  }

  async onExcelFileUploaded(result: ExcelUploadResult): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Traiter les données Excel
      const importedUsers = this.processExcelData(result.previewData);
      
      // Importer les utilisateurs via l'API
      const response = await new Promise<{ imported: number; errors: any[] }>((resolve, reject) => {
        this.userUseCase.importUsers(importedUsers).subscribe({
          next: (result) => resolve(result),
          error: (error) => reject(error)
        });
      });
      
      this.successMessage.set(`${response.imported} utilisateur(s) importé(s) avec succès`);
      this.loadUsers(); // Recharger la liste
      this.closeImportDialog();
      
      setTimeout(() => this.successMessage.set(''), 5000);
      
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || 'Erreur lors de l\'import');
      setTimeout(() => this.errorMessage.set(''), 5000);
    } finally {
      this.isLoading.set(false);
    }
  }

  private processExcelData(previewData: ExcelPreviewData): any[] {
    const users: any[] = [];
    
    previewData.sheets.forEach(sheet => {
      if (!sheet.hasData) return;
      
      const headers = sheet.headers;
      const nomIndex = headers.findIndex(h => h.toLowerCase().includes('nom'));
      const prenomIndex = headers.findIndex(h => h.toLowerCase().includes('prenom'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type'));
      
      sheet.data.forEach(row => {
        if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
          users.push({
            nom: row[nomIndex] || '',
            prenom: row[prenomIndex] || '',
            email: row[emailIndex] || '',
            type: row[typeIndex] || 'ETUDIANT',
            motDePasseHash: null // Sera généré côté serveur
          });
        }
      });
    });
    
    return users;
  }

  onImportCancelled(): void {
    this.closeImportDialog();
  }

  onValidationCompleted(result: { isValid: boolean; errors: string[] }): void {
    if (!result.isValid) {
      this.errorMessage.set(`Validation échouée: ${result.errors.join(', ')}`);
      setTimeout(() => this.errorMessage.set(''), 5000);
    }
  }

  // Expose Math for template
  Math = Math;
}

