import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { User } from '../../../core/domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../core/domain/repositories/user.repository.interface';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { UserCacheService } from '../../../core/services/user-cache.service';
import { SchoolService, School } from '../../../core/services/school.service';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit, OnDestroy {
  admins = signal<User[]>([]);
  filteredAdmins = signal<User[]>([]);
  paginatedAdmins = signal<User[]>([]);
  schools = signal<School[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showPasswordModal = signal(false);
  selectedAdmin = signal<User | null>(null);
  searchQuery = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  
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
    ecoleId: '',
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
  private schoolService = inject(SchoolService);

  constructor(private userUseCase: UserUseCase) {}

  ngOnInit(): void {
    this.loadAdmins();
    this.loadSchools();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdmins(): void {
    this.isLoading.set(true);
    
    this.userUseCase.getAllUsers(false).subscribe({
      next: (users) => {
        console.log('📊 Tous les utilisateurs reçus:', users);
        // Filtrer pour ne garder que les administrateurs actifs
        const admins = users.filter(u => u.role === 'ADMIN' && u.estActif);
        console.log('👥 Administrateurs filtrés:', admins);
        console.log('🏫 Détails du premier admin:', admins.length > 0 ? admins[0] : 'Aucun');
        this.admins.set(admins);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des administrateurs:', error);
        this.errorMessage.set('Erreur lors du chargement des administrateurs');
        this.isLoading.set(false);
      }
    });
  }

  loadSchools(): void {
    this.schoolService.getAllSchools()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schools) => {
          this.schools.set(schools);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des écoles:', error);
          // Fallback vers des données mockées si l'API échoue
          this.schools.set([
            { id: '12fc03d5-dadb-49cf-b8a8-2685cd27ae6d', nom: 'Saint Jean Ingenieur' },
            { id: 'e8c35431-10a5-48aa-a07e-a48019d484ae', nom: 'Saint Jean School of Management' }
          ]);
        }
      });
  }

  applyFilters(): void {
    let filtered = this.admins();
    
    // Filtre par recherche
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(u => 
        u.nom.toLowerCase().includes(query) ||
        u.prenom.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    
    // Filtre par statut
    if (this.statusFilter() === 'active') {
      filtered = filtered.filter(u => u.estActif === true);
    } else if (this.statusFilter() === 'inactive') {
      filtered = filtered.filter(u => u.estActif === false);
    }
    
    this.filteredAdmins.set(filtered);
    this.currentPage.set(1);
    this.updatePagination();
  }

  setStatusFilter(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  getActiveCount(): number {
    return this.admins().filter(a => a.estActif === true).length;
  }

  getInactiveCount(): number {
    return this.admins().filter(a => a.estActif === false).length;
  }

  updatePagination(): void {
    const filtered = this.filteredAdmins();
    const total = Math.ceil(filtered.length / this.itemsPerPage());
    this.totalPages.set(total);
    
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    this.paginatedAdmins.set(filtered.slice(start, end));
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

  openCreateModal(): void {
    this.selectedAdmin.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(admin: User): void {
    this.selectedAdmin.set(admin);
    this.formData = {
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      motDePasse: '',
      ecoleId: (admin as any).ecoleId || '',
      generatePassword: false
    };
    this.showModal.set(true);
  }

  openPasswordModal(admin: User): void {
    this.selectedAdmin.set(admin);
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
      ecoleId: '',
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
    
    if (this.selectedAdmin()) {
      this.updateAdmin();
    } else {
      this.createAdmin();
    }
  }

  createAdmin(): void {
    // Validation
    if (!this.formData.motDePasse) {
      this.errorMessage.set('Le mot de passe est requis');
      return;
    }

    if (!this.formData.ecoleId) {
      this.errorMessage.set('L\'école est requise');
      return;
    }

    const data: CreateUserDto = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      motDePasse: this.formData.motDePasse,
      role: 'ADMIN',
      ecoleId: this.formData.ecoleId
    };

    this.isLoading.set(true);
    this.userUseCase.createUser(data).subscribe({
      next: (newAdmin) => {
        this.successMessage.set('Administrateur créé avec succès');
        this.closeModal();
        this.loadAdmins();
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateAdmin(): void {
    const admin = this.selectedAdmin();
    if (!admin) return;

    const data: UpdateUserDto = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      estActif: admin.estActif
    };

    if (this.formData.ecoleId) {
      data.ecoleId = this.formData.ecoleId;
    }

    this.isLoading.set(true);
    this.userUseCase.updateUser(admin.id.toString(), data).subscribe({
      next: (updatedAdmin) => {
        this.successMessage.set('Administrateur mis à jour avec succès');
        this.closeModal();
        this.loadAdmins();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  async deleteAdmin(admin: User): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`${admin.prenom} ${admin.nom}`);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.userUseCase.deleteUser(admin.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Administrateur supprimé avec succès');
        this.loadAdmins();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async toggleAdminStatus(admin: User): Promise<void> {
    const action = admin.estActif ? 'désactiver' : 'activer';
    const confirmed = await this.confirmationService.confirm({
      title: `Confirmer ${action === 'désactiver' ? 'la désactivation' : 'l\'activation'}`,
      message: `Êtes-vous sûr de vouloir ${action} l'administrateur "${admin.prenom} ${admin.nom}" ?`,
      confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
      cancelText: 'Annuler',
      type: action === 'désactiver' ? 'warning' : 'success',
      icon: action === 'désactiver' ? 'person_off' : 'person'
    });
    
    if (!confirmed) return;

    const data: UpdateUserDto = {
      estActif: !admin.estActif
    };

    this.userUseCase.updateUser(admin.id.toString(), data).subscribe({
      next: (updatedAdmin) => {
        this.successMessage.set(`Administrateur ${data.estActif ? 'activé' : 'désactivé'} avec succès`);
        this.loadAdmins();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification du statut');
      }
    });
  }

  async resetPassword(admin: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Confirmer la réinitialisation',
      message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de "${admin.prenom} ${admin.nom}" ?`,
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
    this.userUseCase.resetPassword(admin.id.toString(), this.passwordData.nouveauMotDePasse).subscribe({
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

  getSchoolName(admin: User): string {
    console.log('🔍 getSchoolName appelé pour:', admin.email);
    console.log('   - admin.ecole:', admin.ecole);
    console.log('   - admin.ecoleId:', admin.ecoleId);
    
    const ecole = admin.ecole;
    if (ecole && ecole.nom) {
      console.log('   ✅ École trouvée:', ecole.nom);
      return ecole.nom;
    }
    // Fallback: chercher dans les écoles chargées
    if (admin.ecoleId) {
      const school = this.schools().find(s => s.id === admin.ecoleId);
      console.log('   🔄 Fallback - École trouvée dans la liste:', school?.nom);
      return school?.nom || 'École non trouvée';
    }
    console.log('   ❌ Aucune école trouvée');
    return 'Non assigné';
  }

  // Expose Math for template
  Math = Math;
}
