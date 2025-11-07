import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  teacher: string;
  students: number;
  status: 'Actif' | 'Inactif';
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  constructor(private router: Router) {}

  courses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  searchTerm = '';
  
  totalCourses = signal(0);
  activeCourses = signal(0);
  totalStudents = signal(0);
  totalCredits = signal(0);

  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  showDeleteModal = false;
  selectedCourse: Course | null = null;

  formData: Partial<Course> = {};

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    const mockCourses: Course[] = [
      { id: '1', code: 'INF101', name: 'Algorithmique et Programmation', credits: 6, semester: 1, teacher: 'Dr. Martin', students: 45, status: 'Actif' },
      { id: '2', code: 'INF102', name: 'Base de Données', credits: 5, semester: 1, teacher: 'Dr. Dubois', students: 42, status: 'Actif' },
      { id: '3', code: 'INF201', name: 'Réseaux Informatiques', credits: 5, semester: 2, teacher: 'Dr. Bernard', students: 38, status: 'Actif' },
      { id: '4', code: 'INF202', name: 'Génie Logiciel', credits: 6, semester: 2, teacher: 'Dr. Laurent', students: 40, status: 'Actif' },
      { id: '5', code: 'MAT101', name: 'Mathématiques Discrètes', credits: 5, semester: 1, teacher: 'Dr. Petit', students: 50, status: 'Actif' }
    ];

    this.courses.set(mockCourses);
    this.filteredCourses.set(mockCourses);
    this.updateStats();
  }

  updateStats(): void {
    const courses = this.courses();
    this.totalCourses.set(courses.length);
    this.activeCourses.set(courses.filter(c => c.status === 'Actif').length);
    this.totalStudents.set(courses.reduce((sum, c) => sum + c.students, 0));
    this.totalCredits.set(courses.reduce((sum, c) => sum + c.credits, 0));
  }

  onSearchChange(): void {
    const search = this.searchTerm.toLowerCase();
    if (search) {
      const filtered = this.courses().filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        c.teacher.toLowerCase().includes(search)
      );
      this.filteredCourses.set(filtered);
    } else {
      this.filteredCourses.set(this.courses());
    }
  }

  addCourse(): void {
    this.formData = {
      code: '',
      name: '',
      credits: 0,
      semester: 1,
      teacher: '',
      students: 0,
      status: 'Actif'
    };
    this.showAddModal = true;
  }

  saveNewCourse(): void {
    const newCourse: Course = {
      id: Date.now().toString(),
      code: this.formData.code || '',
      name: this.formData.name || '',
      credits: this.formData.credits || 0,
      semester: this.formData.semester || 1,
      teacher: this.formData.teacher || '',
      students: this.formData.students || 0,
      status: (this.formData.status as 'Actif' | 'Inactif') || 'Actif'
    };

    const currentCourses = this.courses();
    this.courses.set([...currentCourses, newCourse]);
    this.filteredCourses.set(this.courses());
    this.updateStats();
    this.showAddModal = false;
  }

  editCourse(course: Course): void {
    this.selectedCourse = course;
    this.formData = { ...course };
    this.showEditModal = true;
  }

  saveEditCourse(): void {
    if (this.selectedCourse) {
      const updatedCourses = this.courses().map(c =>
        c.id === this.selectedCourse!.id ? { ...c, ...this.formData } as Course : c
      );
      this.courses.set(updatedCourses);
      this.filteredCourses.set(updatedCourses);
      this.updateStats();
      this.showEditModal = false;
      this.selectedCourse = null;
    }
  }

  deleteCourse(course: Course): void {
    this.selectedCourse = course;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.selectedCourse) {
      const updatedCourses = this.courses().filter(c => c.id !== this.selectedCourse!.id);
      this.courses.set(updatedCourses);
      this.filteredCourses.set(updatedCourses);
      this.updateStats();
      this.showDeleteModal = false;
      this.selectedCourse = null;
    }
  }

  viewDetails(course: Course): void {
    this.selectedCourse = course;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.showDeleteModal = false;
    this.selectedCourse = null;
  }
}
