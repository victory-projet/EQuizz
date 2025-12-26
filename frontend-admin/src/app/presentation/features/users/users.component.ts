import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { User } from '../../../core/domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../core/domain/repositories/user.repository.interface';
import { ConfirmationService } from '../../shared/services/confirmation.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  paginatedUsers = signal<User[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showPasswordModal = signal(false);
  selectedUser = signal<User | null>(null);
  searchQuery = signal('');
  filterRole = signal<string>('ALL');
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalPages = signal(1);

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

  constructor(private userUseCase: UserUseCase) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userUseCase.getAllUsers().subscribe({
      next: (users) => {
        // Filtrer pour ne garder que les administrateurs
        const admins = users.filter(u => u.role === 'ADMIN');
        this.users.set(admins);
        this.applyFilters();
        this.isLoading.set(false);
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
      next: () => {
        this.successMessage.set('Administrateur créé avec succès');
        this.closeModal();
        this.loadUsers();
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
      next: () => {
        this.successMessage.set('Utilisateur mis à jour avec succès');
        this.closeModal();
        this.loadUsers();
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
        this.loadUsers();
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
      next: () => {
        this.successMessage.set(`Utilisateur ${data.estActif ? 'activé' : 'désactivé'} avec succès`);
        this.loadUsers();
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

  // Expose Math for template
  Math = Math;
}

