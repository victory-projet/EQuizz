import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  classId?: string;
  className?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

interface Class {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SvgIconComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserManagementComponent implements OnInit {
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  classes = signal<Class[]>([]);
  
  searchTerm = signal('');
  currentFilter = signal<'all' | 'admin' | 'teacher' | 'student'>('all');
  isLoading = signal(false);
  
  // Modal states
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  showAssignClassModal = signal(false);
  
  // Form data
  formMode: 'create' | 'edit' = 'create';
  selectedUser = signal<User | null>(null);
  
  formData = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'admin' | 'teacher' | 'student',
    password: '',
    isActive: true,
    classId: ''
  };

  // Stats
  totalUsers = signal(0);
  activeUsers = signal(0);
  totalStudents = signal(0);
  totalTeachers = signal(0);

  ngOnInit(): void {
    this.loadUsers();
    this.loadClasses();
  }

  loadUsers(): void {
    // Mock data - À remplacer par un vrai service
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@equizz.com',
        firstName: 'Admin',
        lastName: 'Principal',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date()
      },
      {
        id: '2',
        email: 'prof.martin@equizz.com',
        firstName: 'Jean',
        lastName: 'Martin',
        role: 'teacher',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        lastLoginAt: new Date()
      },
      {
        id: '3',
        email: 'marie.dubois@student.com',
        firstName: 'Marie',
        lastName: 'Dubois',
        role: 'student',
        isActive: true,
        classId: 'class-1',
        className: 'L1 Info A',
        createdAt: new Date('2024-09-01')
      },
      {
        id: '4',
        email: 'pierre.durand@student.com',
        firstName: 'Pierre',
        lastName: 'Durand',
        role: 'student',
        isActive: true,
        classId: 'class-1',
        className: 'L1 Info A',
        createdAt: new Date('2024-09-01')
      }
    ];

    this.users.set(mockUsers);
    this.filteredUsers.set(mockUsers);
    this.updateStats();
  }

  loadClasses(): void {
    // Mock data
    this.classes.set([
      { id: 'class-1', name: 'L1 Info A' },
      { id: 'class-2', name: 'L1 Info B' },
      { id: 'class-3', name: 'L2 Info' },
      { id: 'class-4', name: 'L3 Info' }
    ]);
  }

  updateStats(): void {
    const users = this.users();
    this.totalUsers.set(users.length);
    this.activeUsers.set(users.filter(u => u.isActive).length);
    this.totalStudents.set(users.filter(u => u.role === 'student').length);
    this.totalTeachers.set(users.filter(u => u.role === 'teacher').length);
  }

  setFilter(filter: 'all' | 'admin' | 'teacher' | 'student'): void {
    this.currentFilter.set(filter);
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.users();

    // Filtre par rôle
    if (this.currentFilter() !== 'all') {
      filtered = filtered.filter(u => u.role === this.currentFilter());
    }

    // Filtre par recherche
    const search = this.searchTerm();
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredUsers.set(filtered);
  }

  addUser(): void {
    this.formMode = 'create';
    this.selectedUser.set(null);
    this.resetForm();
    this.showFormModal.set(true);
  }

  editUser(user: User): void {
    this.formMode = 'edit';
    this.selectedUser.set(user);
    this.formData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
      isActive: user.isActive,
      classId: user.classId || ''
    };
    this.showFormModal.set(true);
  }

  deleteUser(user: User): void {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  toggleUserStatus(user: User): void {
    const index = this.users().findIndex(u => u.id === user.id);
    if (index !== -1) {
      const updatedUsers = [...this.users()];
      updatedUsers[index] = { ...user, isActive: !user.isActive };
      this.users.set(updatedUsers);
      this.applyFilters();
      this.updateStats();
      
      const status = updatedUsers[index].isActive ? 'activé' : 'désactivé';
      this.toastService.success(`Utilisateur ${status} avec succès`);
    }
  }

  assignClass(user: User): void {
    if (user.role !== 'student') {
      this.toastService.warning('Seuls les étudiants peuvent être assignés à une classe');
      return;
    }
    this.selectedUser.set(user);
    this.formData.classId = user.classId || '';
    this.showAssignClassModal.set(true);
  }

  saveUser(): void {
    // Validation
    if (!this.formData.email || !this.formData.firstName || !this.formData.lastName) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.formMode === 'create' && !this.formData.password) {
      this.toastService.error('Le mot de passe est obligatoire');
      return;
    }

    if (this.formMode === 'create') {
      // Créer un nouvel utilisateur
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: this.formData.email,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        role: this.formData.role,
        isActive: this.formData.isActive,
        classId: this.formData.role === 'student' ? this.formData.classId : undefined,
        className: this.formData.role === 'student' && this.formData.classId 
          ? this.classes().find(c => c.id === this.formData.classId)?.name 
          : undefined,
        createdAt: new Date()
      };

      this.users.update(users => [...users, newUser]);
      this.toastService.success('Utilisateur créé avec succès');
    } else {
      // Modifier un utilisateur existant
      const selected = this.selectedUser();
      if (selected) {
        const index = this.users().findIndex(u => u.id === selected.id);
        if (index !== -1) {
          const updatedUsers = [...this.users()];
          updatedUsers[index] = {
            ...updatedUsers[index],
            email: this.formData.email,
            firstName: this.formData.firstName,
            lastName: this.formData.lastName,
            role: this.formData.role,
            isActive: this.formData.isActive,
            classId: this.formData.role === 'student' ? this.formData.classId : undefined,
            className: this.formData.role === 'student' && this.formData.classId
              ? this.classes().find(c => c.id === this.formData.classId)?.name
              : undefined
          };
          this.users.set(updatedUsers);
          this.toastService.success('Utilisateur modifié avec succès');
        }
      }
    }

    this.applyFilters();
    this.updateStats();
    this.closeModal();
  }

  confirmDelete(): void {
    const selected = this.selectedUser();
    if (selected) {
      this.users.update(users => users.filter(u => u.id !== selected.id));
      this.applyFilters();
      this.updateStats();
      this.toastService.success('Utilisateur supprimé avec succès');
      this.closeModal();
    }
  }

  saveClassAssignment(): void {
    const selected = this.selectedUser();
    if (selected && this.formData.classId) {
      const index = this.users().findIndex(u => u.id === selected.id);
      if (index !== -1) {
        const updatedUsers = [...this.users()];
        const className = this.classes().find(c => c.id === this.formData.classId)?.name;
        updatedUsers[index] = {
          ...updatedUsers[index],
          classId: this.formData.classId,
          className: className
        };
        this.users.set(updatedUsers);
        this.applyFilters();
        this.toastService.success('Étudiant assigné à la classe avec succès');
        this.closeModal();
      }
    }
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.showDeleteModal.set(false);
    this.showAssignClassModal.set(false);
    this.selectedUser.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      email: '',
      firstName: '',
      lastName: '',
      role: 'student',
      password: '',
      isActive: true,
      classId: ''
    };
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'badge-admin',
      teacher: 'badge-teacher',
      student: 'badge-student'
    };
    return classes[role] || '';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      student: 'Étudiant'
    };
    return labels[role] || role;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
