import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

import { AcademicYearRepository } from '../../infrastructure/repositories/academic-year.repository';
import { ClassRepository } from '../../infrastructure/repositories/class.repository';
import { CourseRepository } from '../../infrastructure/repositories/course.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

import { 
  SimpleAcademicYear, 
  SimpleSemester, 
  SimpleClass, 
  SimpleCourse, 
  SimpleStudent, 
  SimpleTeacher 
} from '../models/simplified.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  private currentAcademicYearSubject = new BehaviorSubject<SimpleAcademicYear | null>(null);
  public currentAcademicYear$ = this.currentAcademicYearSubject.asObservable();

  constructor(
    private academicYearRepository: AcademicYearRepository,
    private classRepository: ClassRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository
  ) {
    this.loadCurrentAcademicYear();
  }

  // ============================================
  // ANNÉES ACADÉMIQUES
  // ============================================

  getAcademicYears(): Observable<SimpleAcademicYear[]> {
    return this.academicYearRepository.findAll().pipe(
      shareReplay(1)
    );
  }

  getAcademicYearById(id: string): Observable<SimpleAcademicYear> {
    return this.academicYearRepository.findById(id);
  }

  getCurrentAcademicYear(): Observable<SimpleAcademicYear | null> {
    return this.academicYearRepository.findCurrent();
  }

  createAcademicYear(data: Partial<SimpleAcademicYear>): Observable<SimpleAcademicYear> {
    return this.academicYearRepository.create(data).pipe(
      tap(() => this.loadCurrentAcademicYear())
    );
  }

  updateAcademicYear(id: string, data: Partial<SimpleAcademicYear>): Observable<SimpleAcademicYear> {
    return this.academicYearRepository.update(id, data).pipe(
      tap(() => this.loadCurrentAcademicYear())
    );
  }

  deleteAcademicYear(id: string): Observable<void> {
    return this.academicYearRepository.delete(id).pipe(
      tap(() => this.loadCurrentAcademicYear())
    );
  }

  setCurrentAcademicYear(id: string): Observable<SimpleAcademicYear> {
    return this.academicYearRepository.setCurrent(id).pipe(
      tap(year => {
        this.currentAcademicYearSubject.next(year);
      })
    );
  }

  private loadCurrentAcademicYear(): void {
    this.getCurrentAcademicYear().subscribe(year => {
      this.currentAcademicYearSubject.next(year);
    });
  }

  // ============================================
  // CLASSES
  // ============================================

  getClasses(): Observable<SimpleClass[]> {
    return this.classRepository.findAll().pipe(
      shareReplay(1)
    );
  }

  getClassById(id: string): Observable<SimpleClass> {
    return this.classRepository.findById(id);
  }

  getClassesByAcademicYear(academicYearId: string): Observable<SimpleClass[]> {
    return this.classRepository.findByAcademicYear(academicYearId);
  }

  createClass(data: Partial<SimpleClass>): Observable<SimpleClass> {
    return this.classRepository.create(data);
  }

  updateClass(id: string, data: Partial<SimpleClass>): Observable<SimpleClass> {
    return this.classRepository.update(id, data);
  }

  deleteClass(id: string): Observable<void> {
    return this.classRepository.delete(id);
  }

  addStudentToClass(classId: string, studentId: string): Observable<SimpleClass> {
    return this.classRepository.addStudent(classId, studentId);
  }

  removeStudentFromClass(classId: string, studentId: string): Observable<SimpleClass> {
    return this.classRepository.removeStudent(classId, studentId);
  }

  addCourseToClass(classId: string, courseId: string): Observable<SimpleClass> {
    return this.classRepository.addCourse(classId, courseId);
  }

  removeCourseFromClass(classId: string, courseId: string): Observable<SimpleClass> {
    return this.classRepository.removeCourse(classId, courseId);
  }

  // ============================================
  // COURS
  // ============================================

  getCourses(): Observable<SimpleCourse[]> {
    return this.courseRepository.findAll().pipe(
      shareReplay(1)
    );
  }

  getCourseById(id: string): Observable<SimpleCourse> {
    return this.courseRepository.findById(id);
  }

  getCoursesByTeacher(teacherId: string): Observable<SimpleCourse[]> {
    return this.courseRepository.findByTeacher(teacherId);
  }

  getCoursesByAcademicYear(academicYearId: string): Observable<SimpleCourse[]> {
    return this.courseRepository.findByAcademicYear(academicYearId);
  }

  getCoursesBySemester(semesterId: string): Observable<SimpleCourse[]> {
    return this.courseRepository.findBySemester(semesterId);
  }

  getActiveCourses(): Observable<SimpleCourse[]> {
    return this.courseRepository.findActive();
  }

  getArchivedCourses(): Observable<SimpleCourse[]> {
    return this.courseRepository.findArchived();
  }

  createCourse(data: Partial<SimpleCourse>): Observable<SimpleCourse> {
    return this.courseRepository.create(data);
  }

  updateCourse(id: string, data: Partial<SimpleCourse>): Observable<SimpleCourse> {
    return this.courseRepository.update(id, data);
  }

  deleteCourse(id: string): Observable<void> {
    return this.courseRepository.delete(id);
  }

  archiveCourse(id: string): Observable<SimpleCourse> {
    return this.courseRepository.archive(id);
  }

  unarchiveCourse(id: string): Observable<SimpleCourse> {
    return this.courseRepository.unarchive(id);
  }

  // ============================================
  // UTILISATEURS
  // ============================================

  getStudents(): Observable<SimpleStudent[]> {
    return this.userRepository.getAllStudents().pipe(
      shareReplay(1)
    );
  }

  getStudentById(id: string): Observable<SimpleStudent> {
    return this.userRepository.getStudentById(id);
  }

  getStudentsByClass(classId: string): Observable<SimpleStudent[]> {
    return this.userRepository.getStudentsByClass(classId);
  }

  createStudent(data: Partial<SimpleStudent>): Observable<SimpleStudent> {
    return this.userRepository.createStudent(data);
  }

  updateStudent(id: string, data: Partial<SimpleStudent>): Observable<SimpleStudent> {
    return this.userRepository.updateStudent(id, data);
  }

  deleteStudent(id: string): Observable<void> {
    return this.userRepository.deleteStudent(id);
  }

  getTeachers(): Observable<SimpleTeacher[]> {
    return this.userRepository.getAllTeachers().pipe(
      shareReplay(1)
    );
  }

  getTeacherById(id: string): Observable<SimpleTeacher> {
    return this.userRepository.getTeacherById(id);
  }

  createTeacher(data: Partial<SimpleTeacher>): Observable<SimpleTeacher> {
    return this.userRepository.createTeacher(data);
  }

  updateTeacher(id: string, data: Partial<SimpleTeacher>): Observable<SimpleTeacher> {
    return this.userRepository.updateTeacher(id, data);
  }

  deleteTeacher(id: string): Observable<void> {
    return this.userRepository.deleteTeacher(id);
  }

  // ============================================
  // DONNÉES COMBINÉES
  // ============================================

  getAcademicOverview(): Observable<{
    academicYears: SimpleAcademicYear[];
    classes: SimpleClass[];
    courses: SimpleCourse[];
    students: SimpleStudent[];
    teachers: SimpleTeacher[];
  }> {
    return combineLatest([
      this.getAcademicYears(),
      this.getClasses(),
      this.getCourses(),
      this.getStudents(),
      this.getTeachers()
    ]).pipe(
      map(([academicYears, classes, courses, students, teachers]) => ({
        academicYears,
        classes,
        courses,
        students,
        teachers
      }))
    );
  }

  getClassDetails(classId: string): Observable<{
    class: SimpleClass;
    students: SimpleStudent[];
  }> {
    return combineLatest([
      this.getClassById(classId),
      this.getStudentsByClass(classId)
    ]).pipe(
      map(([classData, students]) => ({
        class: classData,
        students
      }))
    );
  }

  getCourseDetails(courseId: string): Observable<{
    course: SimpleCourse;
  }> {
    return this.getCourseById(courseId).pipe(
      map(course => ({
        course
      }))
    );
  }

  // ============================================
  // MÉTHODES DE COMPATIBILITÉ (pour l'ancien code)
  // ============================================

  /**
   * @deprecated Utiliser getClasses() à la place
   */
  getClassesByYear(yearId: string): Observable<SimpleClass[]> {
    return this.getClassesByAcademicYear(yearId);
  }

  /**
   * @deprecated Utiliser getCourses() à la place
   */
  getSubjects(yearId?: string): Observable<SimpleCourse[]> {
    if (yearId) {
      return this.getCoursesByAcademicYear(yearId);
    }
    return this.getCourses();
  }
}
