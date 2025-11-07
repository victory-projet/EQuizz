import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Class, Student } from '../../shared/interfaces/class.interface';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private classesSubject = new BehaviorSubject<Class[]>([]);
  public classes$ = this.classesSubject.asObservable();

  private mockClasses: Class[] = [
    {
      id: '1',
      name: 'L1 Info A',
      level: 'Licence 1',
      academicYear: '2024-2025',
      studentCount: 45,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '2',
      name: 'L1 Info B',
      level: 'Licence 1',
      academicYear: '2024-2025',
      studentCount: 42,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '3',
      name: 'L2 Info',
      level: 'Licence 2',
      academicYear: '2024-2025',
      studentCount: 38,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '4',
      name: 'L3 Info A',
      level: 'Licence 3',
      academicYear: '2024-2025',
      studentCount: 35,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '5',
      name: 'L3 Info B',
      level: 'Licence 3',
      academicYear: '2024-2025',
      studentCount: 33,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '6',
      name: 'M1 Info',
      level: 'Master 1',
      academicYear: '2024-2025',
      studentCount: 28,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '7',
      name: 'M2 Info',
      level: 'Master 2',
      academicYear: '2024-2025',
      studentCount: 25,
      createdAt: new Date('2024-09-01')
    }
  ];

  private mockStudents: Map<string, Student[]> = new Map();

  constructor(private toastService: ToastService) {
    this.classesSubject.next(this.mockClasses);
    this.initializeMockStudents();
  }

  private initializeMockStudents(): void {
    // Quelques étudiants de test pour la classe L1 Info A
    this.mockStudents.set('1', [
      {
        id: 's1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        studentNumber: '20240001'
      },
      {
        id: 's2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        studentNumber: '20240002'
      }
    ]);
  }

  getClasses(): Observable<Class[]> {
    return this.classes$;
  }

  getClassById(id: string): Class | undefined {
    return this.mockClasses.find(c => c.id === id);
  }

  createClass(classData: Omit<Class, 'id' | 'createdAt' | 'studentCount'>): void {
    const newClass: Class = {
      ...classData,
      id: this.generateId(),
      studentCount: 0,
      createdAt: new Date()
    };
    this.mockClasses.push(newClass);
    this.classesSubject.next([...this.mockClasses]);
    this.toastService.success('Classe créée avec succès !');
  }

  updateClass(id: string, updates: Partial<Class>): void {
    const index = this.mockClasses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockClasses[index] = {
        ...this.mockClasses[index],
        ...updates,
        updatedAt: new Date()
      };
      this.classesSubject.next([...this.mockClasses]);
      this.toastService.success('Classe mise à jour avec succès !');
    } else {
      this.toastService.error('Classe introuvable');
    }
  }

  deleteClass(id: string): void {
    // TODO: Vérifier qu'aucun quiz n'est associé à cette classe
    const index = this.mockClasses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockClasses.splice(index, 1);
      this.mockStudents.delete(id);
      this.classesSubject.next([...this.mockClasses]);
      this.toastService.success('Classe supprimée avec succès !');
    } else {
      this.toastService.error('Classe introuvable');
    }
  }

  getStudentsByClass(classId: string): Student[] {
    return this.mockStudents.get(classId) || [];
  }

  assignStudents(classId: string, studentIds: string[]): void {
    // TODO: Implémenter l'assignation réelle
    this.toastService.success(`${studentIds.length} étudiant(s) assigné(s) à la classe`);
  }

  removeStudent(classId: string, studentId: string): void {
    const students = this.mockStudents.get(classId);
    if (students) {
      const filtered = students.filter(s => s.id !== studentId);
      this.mockStudents.set(classId, filtered);
      
      // Mettre à jour le compteur
      const classIndex = this.mockClasses.findIndex(c => c.id === classId);
      if (classIndex !== -1) {
        this.mockClasses[classIndex].studentCount = filtered.length;
        this.classesSubject.next([...this.mockClasses]);
      }
      
      this.toastService.success('Étudiant retiré de la classe');
    }
  }

  searchClasses(term: string): Class[] {
    if (!term.trim()) {
      return this.mockClasses;
    }
    const searchTerm = term.toLowerCase();
    return this.mockClasses.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.level.toLowerCase().includes(searchTerm) ||
      c.academicYear.includes(searchTerm)
    );
  }

  private generateId(): string {
    return `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
