// src/app/core/services/academic.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GetAllAcademicYearsUseCase } from '../application/use-cases/academic-year/get-all-academic-years.use-case';
import { GetAllClassesUseCase } from '../application/use-cases/class/get-all-classes.use-case';
import { GetAllCoursesUseCase } from '../application/use-cases/course/get-all-courses.use-case';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  private getAllAcademicYearsUseCase = inject(GetAllAcademicYearsUseCase);
  private getAllClassesUseCase = inject(GetAllClassesUseCase);
  private getAllCoursesUseCase = inject(GetAllCoursesUseCase);

  /**
   * Récupérer toutes les années académiques
   */
  getAcademicYears(): Observable<any[]> {
    return this.getAllAcademicYearsUseCase.execute().pipe(
      map(years => years.map(year => ({
        id: year.id,
        name: year.name,
        isActive: year.isActive,
        startDate: year.startDate,
        endDate: year.endDate
      })))
    );
  }

  /**
   * Récupérer l'année académique en cours (active)
   */
  getCurrentAcademicYear(): Observable<any | null> {
    return this.getAllAcademicYearsUseCase.execute().pipe(
      map(years => {
        const currentYear = years.find(year => year.isActive);
        if (currentYear) {
          return {
            id: currentYear.id,
            name: currentYear.name,
            isActive: currentYear.isActive,
            startDate: currentYear.startDate,
            endDate: currentYear.endDate
          };
        }
        return null;
      })
    );
  }

  /**
   * Récupérer toutes les classes
   */
  getClasses(): Observable<any[]> {
    return this.getAllClassesUseCase.execute().pipe(
      map(classes => classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        academicYearId: cls.academicYearId,
        studentCount: cls.getStudentCount()
      })))
    );
  }

  /**
   * Récupérer les classes d'une année académique
   */
  getClassesByYear(yearId: string): Observable<any[]> {
    return this.getAllClassesUseCase.execute().pipe(
      map(classes => 
        classes
          .filter(cls => cls.academicYearId === yearId)
          .map(cls => ({
            id: cls.id,
            name: cls.name,
            level: cls.level,
            academicYearId: cls.academicYearId,
            studentCount: cls.getStudentCount()
          }))
      )
    );
  }

  /**
   * Récupérer tous les cours (matières)
   */
  getSubjects(yearId?: string): Observable<any[]> {
    return this.getAllCoursesUseCase.execute().pipe(
      map(courses => courses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description
      })))
    );
  }
}
