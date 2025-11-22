// Mapper pour les entités académiques
import { AcademicYear, Period } from '../../core/domain/entities/academic-year.entity';
import { Class } from '../../core/domain/entities/class.entity';
import { Course } from '../../core/domain/entities/course.entity';
import {
  BackendAnneeAcademique,
  BackendSemestre,
  BackendClasse,
  BackendCours,
  BackendAnneeAcademiqueRequest,
  BackendSemestreRequest,
  BackendClasseRequest,
  BackendCoursRequest
} from '../http/interfaces/backend.interfaces';

export class AcademicMapper {
  // ============================================
  // ANNÉE ACADÉMIQUE
  // ============================================

  /**
   * Convertir BackendAnneeAcademique vers AcademicYear (Domain)
   */
  static toAcademicYear(backend: BackendAnneeAcademique): AcademicYear {
    const periods = backend.semestres?.map(s => this.toPeriod(s)) || [];
    
    return new AcademicYear(
      backend.id.toString(),
      backend.nom,
      new Date(backend.dateDebut),
      new Date(backend.dateFin),
      backend.estActive,
      periods
    );
  }

  /**
   * Convertir AcademicYear vers BackendAnneeAcademiqueRequest
   */
  static toBackendAnneeAcademiqueRequest(year: AcademicYear): BackendAnneeAcademiqueRequest {
    return {
      nom: year.name,
      dateDebut: year.startDate.toISOString().split('T')[0],
      dateFin: year.endDate.toISOString().split('T')[0],
      estActive: year.isActive
    };
  }

  // ============================================
  // PÉRIODE / SEMESTRE
  // ============================================

  /**
   * Convertir BackendSemestre vers Period (Domain)
   */
  static toPeriod(backend: BackendSemestre): Period {
    return new Period(
      backend.id.toString(),
      backend.nom,
      backend.type as 'semester' | 'trimester',
      new Date(backend.dateDebut),
      new Date(backend.dateFin)
    );
  }

  /**
   * Convertir Period vers BackendSemestreRequest
   */
  static toBackendSemestreRequest(period: Period, anneeAcademiqueId: number): BackendSemestreRequest {
    return {
      nom: period.name,
      type: period.type,
      dateDebut: period.startDate.toISOString().split('T')[0],
      dateFin: period.endDate.toISOString().split('T')[0],
      anneeAcademiqueId
    };
  }

  // ============================================
  // CLASSE
  // ============================================

  /**
   * Convertir BackendClasse vers Class (Domain)
   */
  static toClass(backend: BackendClasse): Class {
    const studentIds = backend.etudiants?.map(e => e.id.toString()) || [];
    const courseIds = backend.cours?.map(c => c.id.toString()) || [];
    
    return new Class(
      backend.id.toString(),
      backend.nom,
      backend.niveau,
      backend.anneeAcademiqueId.toString(),
      studentIds,
      courseIds,
      backend.createdAt ? new Date(backend.createdAt) : new Date()
    );
  }

  /**
   * Convertir Class vers BackendClasseRequest
   */
  static toBackendClasseRequest(classEntity: Class): BackendClasseRequest {
    return {
      nom: classEntity.name,
      niveau: classEntity.level,
      anneeAcademiqueId: parseInt(classEntity.academicYearId)
    };
  }

  // ============================================
  // COURS
  // ============================================

  /**
   * Convertir BackendCours vers Course (Domain)
   */
  static toCourse(backend: BackendCours): Course {
    return new Course(
      backend.id.toString(),
      backend.code,
      backend.nom,
      backend.description || '',
      backend.enseignantId?.toString() || '',
      backend.anneeAcademiqueId.toString(),
      backend.semestreId?.toString() || '',
      backend.createdAt ? new Date(backend.createdAt) : new Date()
    );
  }

  /**
   * Convertir Course vers BackendCoursRequest
   */
  static toBackendCoursRequest(course: Course): BackendCoursRequest {
    return {
      code: course.code,
      nom: course.name,
      description: course.description,
      enseignantId: course.teacherId ? parseInt(course.teacherId) : undefined,
      anneeAcademiqueId: parseInt(course.academicYearId),
      semestreId: course.semesterId ? parseInt(course.semesterId) : undefined
    };
  }
}
