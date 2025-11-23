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
    const periods = backend.Semestres?.map((s: BackendSemestre) => this.toPeriod(s)) || [];
    
    return new AcademicYear(
      backend.id.toString(),
      backend.libelle,
      new Date(backend.dateDebut),
      new Date(backend.dateFin),
      backend.estCourante,
      periods
    );
  }

  /**
   * Convertir AcademicYear vers BackendAnneeAcademiqueRequest
   */
  static toBackendAnneeAcademiqueRequest(year: AcademicYear): BackendAnneeAcademiqueRequest {
    return {
      libelle: year.name,
      dateDebut: year.startDate.toISOString().split('T')[0],
      dateFin: year.endDate.toISOString().split('T')[0],
      estCourante: year.isActive
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
      backend.numero === 1 ? 'semester' : 'trimester',
      new Date(backend.dateDebut),
      new Date(backend.dateFin)
    );
  }

  /**
   * Convertir Period vers BackendSemestreRequest
   */
  static toBackendSemestreRequest(period: Period, anneeAcademiqueId: string): BackendSemestreRequest {
    return {
      nom: period.name,
      numero: period.type === 'semester' ? 1 : 2,
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
    const studentIds = backend.Etudiants?.map((e: any) => e.id.toString()) || [];
    const courseIds = backend.Cours?.map((c: any) => c.id.toString()) || [];
    
    return new Class(
      backend.id.toString(),
      backend.nom,
      backend.niveau,
      backend.AnneeAcademique?.id?.toString() || backend.annee_academique_id?.toString() || '',
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
      anneeAcademiqueId: classEntity.academicYearId
    };
  }

  // ============================================
  // COURS
  // ============================================

  /**
   * Convertir BackendCours vers Course (Domain)
   */
  static toCourse(backend: BackendCours): Course {
    // Extraire l'ID de l'enseignant depuis l'objet Enseignant ou depuis enseignant_id
    const teacherId = backend.Enseignant?.id?.toString() || backend.enseignant_id?.toString() || '';
    
    return new Course(
      backend.id.toString(),
      backend.code,
      backend.nom,
      '',
      teacherId,
      backend.AnneeAcademique?.id?.toString() || backend.annee_academique_id?.toString() || '',
      backend.Semestre?.id?.toString() || backend.semestre_id?.toString() || '',
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
      estArchive: false,
      enseignantId: course.teacherId || undefined,
      anneeAcademiqueId: course.academicYearId,
      semestreId: course.semesterId || undefined
    };
  }
}
