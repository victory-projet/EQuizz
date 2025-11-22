// src/app/core/infrastructure/repositories/class.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Class, Student } from '../../core/domain/entities/class.entity';
import { IClassRepository, IStudentRepository } from '../../core/domain/repositories/class.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class ClassRepository implements IClassRepository {
  private classes: Class[] = this.initMockData();

  getAll(): Observable<Class[]> {
    return of([...this.classes]).pipe(delay(300));
  }

  getById(id: string): Observable<Class> {
    const classEntity = this.classes.find(c => c.id === id);
    if (!classEntity) {
      return throwError(() => new Error(`Classe ${id} non trouvée`));
    }
    return of(classEntity).pipe(delay(200));
  }

  getByAcademicYear(yearId: string): Observable<Class[]> {
    const filtered = this.classes.filter(c => c.academicYearId === yearId);
    return of(filtered).pipe(delay(300));
  }

  create(classEntity: Class): Observable<Class> {
    this.classes.unshift(classEntity);
    return of(classEntity).pipe(delay(300));
  }

  update(id: string, updates: Partial<Class>): Observable<Class> {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Classe ${id} non trouvée`));
    }

    // Mettre à jour les propriétés de l'objet existant
    Object.assign(this.classes[index], updates);
    return of(this.classes[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Classe ${id} non trouvée`));
    }

    this.classes.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  addStudent(classId: string, studentId: string): Observable<void> {
    const classEntity = this.classes.find(c => c.id === classId);
    if (!classEntity) {
      return throwError(() => new Error(`Classe ${classId} non trouvée`));
    }

    classEntity.addStudent(studentId);
    return of(void 0).pipe(delay(300));
  }

  removeStudent(classId: string, studentId: string): Observable<void> {
    const classEntity = this.classes.find(c => c.id === classId);
    if (!classEntity) {
      return throwError(() => new Error(`Classe ${classId} non trouvée`));
    }

    classEntity.removeStudent(studentId);
    return of(void 0).pipe(delay(300));
  }

  getStudents(classId: string): Observable<Student[]> {
    // Mock: retourner des étudiants fictifs
    return of([]).pipe(delay(300));
  }

  private initMockData(): Class[] {
    const class1 = new Class(
      '1',
      'L1 Info A',
      'Licence 1',
      'year-1',
      ['student-1', 'student-2', 'student-3'],
      ['course-1', 'course-2'],
      new Date('2024-09-01')
    );
    
    const class2 = new Class(
      '2',
      'L1 Info B',
      'Licence 1',
      'year-1',
      ['student-4', 'student-5'],
      ['course-1', 'course-2'],
      new Date('2024-09-01')
    );
    
    const class3 = new Class(
      '3',
      'L2 Info',
      'Licence 2',
      'year-1',
      ['student-6', 'student-7', 'student-8'],
      ['course-3', 'course-4'],
      new Date('2024-09-01')
    );
    
    return [class1, class2, class3];
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudentRepository implements IStudentRepository {
  private students: Student[] = this.initMockData();

  getAll(): Observable<Student[]> {
    return of([...this.students]).pipe(delay(300));
  }

  getById(id: string): Observable<Student> {
    const student = this.students.find(s => s.id === id);
    if (!student) {
      return throwError(() => new Error(`Étudiant ${id} non trouvé`));
    }
    return of(student).pipe(delay(200));
  }

  getByClass(classId: string): Observable<Student[]> {
    const filtered = this.students.filter(s => s.classIds.includes(classId));
    return of(filtered).pipe(delay(300));
  }

  create(student: Student): Observable<Student> {
    this.students.push(student);
    return of(student).pipe(delay(300));
  }

  update(id: string, updates: Partial<Student>): Observable<Student> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Étudiant ${id} non trouvé`));
    }

    this.students[index] = { ...this.students[index], ...updates } as Student;
    return of(this.students[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Étudiant ${id} non trouvé`));
    }

    this.students.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  private initMockData(): Student[] {
    const student1 = new Student(
      'student-1',
      'Jean',
      'Dupont',
      'jean.dupont@example.com',
      'STU001',
      ['1'],
      new Date('2024-09-01')
    );
    
    const student2 = new Student(
      'student-2',
      'Marie',
      'Martin',
      'marie.martin@example.com',
      'STU002',
      ['1'],
      new Date('2024-09-01')
    );
    
    return [student1, student2];
  }
}
