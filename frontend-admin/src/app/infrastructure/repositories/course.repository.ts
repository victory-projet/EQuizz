// src/app/core/infrastructure/repositories/course.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Course, Teacher } from '../../core/domain/entities/course.entity';
import { ICourseRepository, ITeacherRepository } from '../../core/domain/repositories/course.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseRepository implements ICourseRepository {
  private courses: Course[] = this.initMockData();

  getAll(): Observable<Course[]> {
    return of([...this.courses]).pipe(delay(300));
  }

  getById(id: string): Observable<Course> {
    const course = this.courses.find(c => c.id === id);
    if (!course) {
      return throwError(() => new Error(`Cours ${id} non trouvé`));
    }
    return of(course).pipe(delay(200));
  }

  getByAcademicYear(yearId: string): Observable<Course[]> {
    const filtered = this.courses.filter(c => c.academicYearId === yearId);
    return of(filtered).pipe(delay(300));
  }

  getBySemester(semesterId: string): Observable<Course[]> {
    const filtered = this.courses.filter(c => c.semesterId === semesterId);
    return of(filtered).pipe(delay(300));
  }

  getByTeacher(teacherId: string): Observable<Course[]> {
    const filtered = this.courses.filter(c => c.teacherId === teacherId);
    return of(filtered).pipe(delay(300));
  }

  create(course: Course): Observable<Course> {
    this.courses.unshift(course);
    return of(course).pipe(delay(300));
  }

  update(id: string, updates: Partial<Course>): Observable<Course> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Cours ${id} non trouvé`));
    }

    // Mettre à jour les propriétés de l'objet existant
    Object.assign(this.courses[index], updates);
    return of(this.courses[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Cours ${id} non trouvé`));
    }

    this.courses.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  private initMockData(): Course[] {
    const course1 = new Course(
      '1',
      'ALG101',
      'Algorithmique et Programmation',
      'Introduction aux algorithmes et structures de données',
      'teacher-1',
      'year-1',
      'semester-1',
      new Date('2024-09-01')
    );
    
    const course2 = new Course(
      '2',
      'BDD201',
      'Base de Données',
      'Conception et gestion de bases de données relationnelles',
      'teacher-2',
      'year-1',
      'semester-1',
      new Date('2024-09-01')
    );
    
    return [course1, course2];
  }
}

@Injectable({
  providedIn: 'root'
})
export class TeacherRepository implements ITeacherRepository {
  private teachers: Teacher[] = this.initMockData();

  getAll(): Observable<Teacher[]> {
    return of([...this.teachers]).pipe(delay(300));
  }

  getById(id: string): Observable<Teacher> {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) {
      return throwError(() => new Error(`Enseignant ${id} non trouvé`));
    }
    return of(teacher).pipe(delay(200));
  }

  getByDepartment(department: string): Observable<Teacher[]> {
    const filtered = this.teachers.filter(t => t.department === department);
    return of(filtered).pipe(delay(300));
  }

  create(teacher: Teacher): Observable<Teacher> {
    this.teachers.push(teacher);
    return of(teacher).pipe(delay(300));
  }

  update(id: string, updates: Partial<Teacher>): Observable<Teacher> {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Enseignant ${id} non trouvé`));
    }

    Object.assign(this.teachers[index], updates);
    return of(this.teachers[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.teachers.findIndex(t => t.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Enseignant ${id} non trouvé`));
    }

    this.teachers.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  private initMockData(): Teacher[] {
    const teacher1 = new Teacher(
      'teacher-1',
      'Pierre',
      'Durand',
      'pierre.durand@university.com',
      'Informatique',
      ['1']
    );
    
    const teacher2 = new Teacher(
      'teacher-2',
      'Sophie',
      'Bernard',
      'sophie.bernard@university.com',
      'Informatique',
      ['2']
    );
    
    return [teacher1, teacher2];
  }
}
