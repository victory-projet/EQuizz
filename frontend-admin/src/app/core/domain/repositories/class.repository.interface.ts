// src/app/core/domain/repositories/class.repository.interface.ts
import { Observable } from 'rxjs';
import { Class, Student } from '../entities/class.entity';

/**
 * Repository Interface - Class
 */
export abstract class IClassRepository {
  abstract getAll(): Observable<Class[]>;
  abstract getById(id: string): Observable<Class>;
  abstract getByAcademicYear(yearId: string): Observable<Class[]>;
  abstract create(classEntity: Class): Observable<Class>;
  abstract update(id: string, classEntity: Partial<Class>): Observable<Class>;
  abstract delete(id: string): Observable<void>;
  abstract addStudent(classId: string, studentId: string): Observable<void>;
  abstract removeStudent(classId: string, studentId: string): Observable<void>;
  abstract getStudents(classId: string): Observable<Student[]>;
}

/**
 * Repository Interface - Student
 */
export abstract class IStudentRepository {
  abstract getAll(): Observable<Student[]>;
  abstract getById(id: string): Observable<Student>;
  abstract getByClass(classId: string): Observable<Student[]>;
  abstract create(student: Student): Observable<Student>;
  abstract update(id: string, student: Partial<Student>): Observable<Student>;
  abstract delete(id: string): Observable<void>;
}
