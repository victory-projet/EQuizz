import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicRepository } from '../../../infrastructure/repositories/academic.repository';
import { Ecole } from '../../../core/domain/entities/academic.entity';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss']
})
export class SchoolsComponent implements OnInit {
  schools = signal<Ecole[]>([]);
  filteredSchools = signal<Ecole[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Modal states
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  
  // Form data
  selectedSchool = signal<Ecole | null>(null);
  schoolForm = {
    nom: ''
  };
  
  // Search and filter
  searchTerm = signal('');
  
  // Stats
  totalSchools = signal(0);
  activeSchools = signal(0);

  constructor(private academicRepository: AcademicRepository) {}

  ngOnInit() {
    this.loadSchools();
  }

  loadSchools() {
    this.loading.set(true);
    this.error.set(null);
    
    this.academicRepository.getEcoles().subscribe({
      next: (schoolsData) => {
        this.schools.set(schoolsData);
        this.filteredSchools.set(schoolsData);
        this.updateStats();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading schools:', err);
        this.error.set('Erreur lors du chargement des écoles');
        this.loading.set(false);
      }
    });
  }

  updateStats() {
    const schools = this.schools();
    this.totalSchools.set(schools.length);
    // Toutes les écoles sont considérées comme actives
    this.activeSchools.set(schools.length);
  }

  onSearch() {
    const term = this.searchTerm().toLowerCase();
    const schools = this.schools();
    
    if (!term) {
      this.filteredSchools.set(schools);
      return;
    }
    
    const filtered = schools.filter(school =>
      school.nom.toLowerCase().includes(term)
    );
    
    this.filteredSchools.set(filtered);
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal.set(true);
  }

  openEditModal(school: Ecole) {
    this.selectedSchool.set(school);
    this.schoolForm = {
      nom: school.nom
    };
    this.showEditModal.set(true);
  }

  openDeleteModal(school: Ecole) {
    this.selectedSchool.set(school);
    this.showDeleteModal.set(true);
  }

  closeModals() {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedSchool.set(null);
    this.resetForm();
  }

  resetForm() {
    this.schoolForm = {
      nom: ''
    };
  }

  saveSchool() {
    this.loading.set(true);
    
    const operation = this.showEditModal() && this.selectedSchool()
      ? this.academicRepository.updateEcole(this.selectedSchool()!.id, this.schoolForm)
      : this.academicRepository.createEcole(this.schoolForm);
    
    operation.subscribe({
      next: () => {
        this.loadSchools();
        this.closeModals();
      },
      error: (err) => {
        console.error('Error saving school:', err);
        this.error.set('Erreur lors de l\'enregistrement de l\'école');
        this.loading.set(false);
      }
    });
  }

  deleteSchool() {
    const school = this.selectedSchool();
    if (!school) return;
    
    this.loading.set(true);
    
    this.academicRepository.deleteEcole(school.id).subscribe({
      next: () => {
        this.loadSchools();
        this.closeModals();
      },
      error: (err) => {
        console.error('Error deleting school:', err);
        this.error.set('Erreur lors de la suppression de l\'école');
        this.loading.set(false);
      }
    });
  }
}
