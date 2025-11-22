import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';

// Modals
import { AcademicYearFormModalComponent, AcademicYearFormData } from './components/academic-year-form-modal/academic-year-form-modal.component';
import { SemesterFormModalComponent, SemesterFormData } from './components/semester-form-modal/semester-form-modal.component';
import { ConfirmationModalComponent, ConfirmationData } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ToastService } from '../../../core/services/toast.service';

interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  periods: Period[];
  semesters: Period[]; // Alias pour periods
}

interface Period {
  id: string;
  name: string;
  type: 'semester' | 'trimester';
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-academic-year',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SvgIconComponent,
    AcademicYearFormModalComponent,
    SemesterFormModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './academic-year.component.html',
  styleUrls: ['./academic-year.component.scss']
})
export class AcademicYearComponent implements OnInit {
  private toastService = inject(ToastService);

  academicYears: AcademicYear[] = [];
  currentYear: AcademicYear | null = null;

  // Modal states
  showYearFormModal = false;
  showSemesterFormModal = false;
  showDeleteModal = false;
  
  // Modal data
  selectedYear: AcademicYear | null = null;
  yearFormMode: 'create' | 'edit' = 'create';
  confirmationData: ConfirmationData = {
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    isDangerous: true
  };

  ngOnInit(): void {
    this.loadAcademicYears();
  }

  loadAcademicYears(): void {
    // Mock data
    const periods1 = [
      {
        id: '1',
        name: 'Semestre 1',
        type: 'semester' as const,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31')
      },
      {
        id: '2',
        name: 'Semestre 2',
        type: 'semester' as const,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30')
      }
    ];

    this.academicYears = [
      {
        id: '1',
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
        periods: periods1,
        semesters: periods1
      },
      {
        id: '2',
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isActive: false,
        periods: [],
        semesters: []
      }
    ];

    this.currentYear = this.academicYears.find(y => y.isActive) || null;
  }

  toggleActive(year: AcademicYear): void {
    // Désactiver toutes les autres années
    this.academicYears.forEach(y => y.isActive = false);
    year.isActive = true;
    this.currentYear = year;
    this.toastService.success(`Année ${year.name} activée avec succès`);
  }

  // === YEAR MANAGEMENT ===
  addYear(): void {
    this.yearFormMode = 'create';
    this.selectedYear = null;
    this.showYearFormModal = true;
  }

  editYear(year: AcademicYear): void {
    this.yearFormMode = 'edit';
    this.selectedYear = year;
    this.showYearFormModal = true;
  }

  deleteYear(year: AcademicYear): void {
    this.selectedYear = year;
    this.confirmationData = {
      title: 'Supprimer l\'année académique',
      message: 'Êtes-vous sûr de vouloir supprimer cette année académique ? Cette action est irréversible.',
      entityName: year.name,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDangerous: true
    };
    this.showDeleteModal = true;
  }

  onSaveYear(data: AcademicYearFormData): void {
    if (this.yearFormMode === 'create') {
      // Créer une nouvelle année
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        periods: [],
        semesters: []
      };

      if (data.isActive) {
        this.academicYears.forEach(y => y.isActive = false);
        this.currentYear = newYear;
      }

      this.academicYears.unshift(newYear);
      this.toastService.success('Année académique créée avec succès');
    } else {
      // Modifier une année existante
      const index = this.academicYears.findIndex(y => y.id === this.selectedYear?.id);
      if (index !== -1) {
        this.academicYears[index] = {
          ...this.academicYears[index],
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          isActive: data.isActive
        };

        if (data.isActive) {
          this.academicYears.forEach((y, i) => {
            if (i !== index) y.isActive = false;
          });
          this.currentYear = this.academicYears[index];
        }

        this.toastService.success('Année académique modifiée avec succès');
      }
    }

    this.showYearFormModal = false;
    this.selectedYear = null;
  }

  onConfirmDelete(): void {
    if (this.selectedYear) {
      const index = this.academicYears.findIndex(y => y.id === this.selectedYear?.id);
      if (index !== -1) {
        const wasActive = this.academicYears[index].isActive;
        this.academicYears.splice(index, 1);
        
        if (wasActive && this.academicYears.length > 0) {
          this.academicYears[0].isActive = true;
          this.currentYear = this.academicYears[0];
        } else if (this.academicYears.length === 0) {
          this.currentYear = null;
        }

        this.toastService.success('Année académique supprimée avec succès');
      }
    }
    this.showDeleteModal = false;
    this.selectedYear = null;
  }

  // === SEMESTER MANAGEMENT ===
  addSemester(year: AcademicYear): void {
    this.selectedYear = year;
    this.showSemesterFormModal = true;
  }

  onSaveSemester(data: SemesterFormData): void {
    if (this.selectedYear) {
      const newSemester: Period = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      };

      const yearIndex = this.academicYears.findIndex(y => y.id === this.selectedYear?.id);
      if (yearIndex !== -1) {
        this.academicYears[yearIndex].semesters.push(newSemester);
        this.academicYears[yearIndex].periods.push(newSemester);
        
        if (this.currentYear?.id === this.selectedYear.id) {
          this.currentYear = this.academicYears[yearIndex];
        }

        this.toastService.success('Semestre ajouté avec succès');
      }
    }

    this.showSemesterFormModal = false;
    this.selectedYear = null;
  }

  // === MODAL CLOSE HANDLERS ===
  closeYearFormModal(): void {
    this.showYearFormModal = false;
    this.selectedYear = null;
  }

  closeSemesterFormModal(): void {
    this.showSemesterFormModal = false;
    this.selectedYear = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedYear = null;
  }

  // === HELPERS ===
  getYearFormData(): AcademicYearFormData | null {
    if (!this.selectedYear) return null;
    
    return {
      id: this.selectedYear.id,
      name: this.selectedYear.name,
      startDate: this.selectedYear.startDate.toISOString().split('T')[0],
      endDate: this.selectedYear.endDate.toISOString().split('T')[0],
      isActive: this.selectedYear.isActive
    };
  }
}