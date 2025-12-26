import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { User, Etudiant } from '../../../core/domain/entities/user.entity';
import { Classe } from '../../../core/domain/entities/academic.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  students = signal<Etudiant[]>([]);
  filteredStudents = signal<Etudiant[]>([]);
  classes = signal<Classe[]>([]);
  
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedStudent = signal<Etudiant | null>(null);
  
  private confirmationService = inject(ConfirmationService);
  
  searchQuery = signal('');
  filterClasse = signal<string>('ALL');
  filterStatus = signal<string>('ALL');

  formData = {
    nom: '',
    prenom: '',
    email: '',
    matricule: '',
    classeId: '',
    numeroCarteEtudiant: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  totalStudents = computed(() => this.students().length);
  activeStudents = computed(() => this.students().filter(s => s.estActif).length);
  inactiveStudents = computed(() => this.students().filter(s => !s.estActif).length);

  constructor(
    private userUseCase: UserUseCase,
    private academicUseCase: AcademicUseCase
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadClasses();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.userUseCase.getAllUsers().subscribe({
      next: (users: User[]) => {
        const students = users.filter((u: User) => u.role === 'ETUDIANT') as Etudiant[];
        console.log('📚 Étudiants chargés:', students);
        this.students.set(students);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des étudiants:', error);
        this.errorMessage.set('Erreur lors du chargement des étudiants');
        this.isLoading.set(false);
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.students();

    if (this.filterClasse() !== 'ALL') {
      filtered = filtered.filter(s => s.classeId?.toString() === this.filterClasse());
    }

    if (this.filterStatus() !== 'ALL') {
      const isActive = this.filterStatus() === 'ACTIVE';
      filtered = filtered.filter(s => s.estActif === isActive);
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(s =>
        s.nom.toLowerCase().includes(query) ||
        s.prenom.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.matricule && s.matricule.toLowerCase().includes(query))
      );
    }

    this.filteredStudents.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterClasse(classeId: string): void {
    this.filterClasse.set(classeId);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedStudent.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.formData = {
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      matricule: student.matricule || '',
      classeId: student.classeId?.toString() || '',
      numeroCarteEtudiant: student.numeroCarteEtudiant || ''
    };
    this.showModal.set(true);
  }

  openDeleteModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.showDeleteModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showDeleteModal.set(false);
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      matricule: '',
      classeId: '',
      numeroCarteEtudiant: ''
    };
  }

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (this.selectedStudent()) {
      this.updateStudent();
    } else {
      this.createStudent();
    }
  }

  createStudent(): void {
    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      role: 'ETUDIANT' as const,
      matricule: this.formData.matricule || undefined
    };

    this.userUseCase.createUser(data).subscribe({
      next: () => {
        this.successMessage.set('Étudiant créé avec succès');
        this.closeModal();
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateStudent(): void {
    const student = this.selectedStudent();
    if (!student) return;

    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email
    };

    this.userUseCase.updateUser(student.id.toString(), data).subscribe({
      next: () => {
        this.successMessage.set('Étudiant mis à jour avec succès');
        this.closeModal();
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  async deleteStudent(student: Etudiant): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`${student.prenom} ${student.nom}`);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.userUseCase.deleteUser(student.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Étudiant supprimé avec succès');
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async toggleStatus(student: Etudiant): Promise<void> {
    const action = student.estActif ? 'désactiver' : 'activer';
    const confirmed = await this.confirmationService.confirm({
      title: `Confirmer ${action === 'désactiver' ? 'la désactivation' : 'l\'activation'}`,
      message: `Êtes-vous sûr de vouloir ${action} l'étudiant "${student.prenom} ${student.nom}" ?`,
      confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
      cancelText: 'Annuler',
      type: action === 'désactiver' ? 'warning' : 'success',
      icon: action === 'désactiver' ? 'person_off' : 'person'
    });
    
    if (!confirmed) return;

    this.userUseCase.updateUser(student.id.toString(), { estActif: !student.estActif }).subscribe({
      next: () => {
        this.successMessage.set(`Étudiant ${student.estActif ? 'désactivé' : 'activé'} avec succès`);
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }

  getClasseNom(classeId?: number | string): string {
    if (!classeId) return 'Non assignée';
    const classe = this.classes().find(c => c.id.toString() === classeId.toString());
    return classe ? classe.nom : 'Non assignée';
  }
}
