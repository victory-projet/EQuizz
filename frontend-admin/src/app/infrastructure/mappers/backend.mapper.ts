/**
 * Backend Mapper
 * 
 * Convertit les interfaces Backend* (données brutes de l'API)
 * vers les interfaces Simple* (modèle métier frontend)
 * 
 * Responsabilités:
 * - Conversion des noms d'attributs (libelle → label, etc.)
 * - Conversion des types (string → Date)
 * - Gestion des valeurs nulles/undefined
 * - Mapping des relations
 */

import {
  BackendUser,
  BackendEtudiant,
  BackendEnseignant,
  BackendAdministrateur,
  BackendAnneeAcademique,
  BackendSemestre,
  BackendClasse,
  BackendCours,
  BackendEcole,
  BackendEvaluation,
  BackendQuizz,
  BackendQuestion,
  BackendSessionReponse,
  BackendReponseEtudiant,
  BackendNotification,
  BackendDashboardAdmin,
  BackendRapport
} from '../http/interfaces/backend.interfaces';

import {
  SimpleUser,
  SimpleStudent,
  SimpleTeacher,
  SimpleAdministrator,
  SimpleAcademicYear,
  SimpleSemester,
  SimpleClass,
  SimpleCourse,
  SimpleSchool,
  SimpleEvaluation,
  SimpleQuiz,
  SimpleQuestion,
  SimpleQuizSession,
  SimpleStudentAnswer,
  SimpleNotification,
  SimpleDashboard,
  SimpleReport
} from '../../core/models/simplified.interfaces';

export class BackendMapper {
  
  // ============================================
  // UTILISATEUR
  // ============================================
  
  static toUser(backend: BackendUser): SimpleUser {
    return {
      id: backend.id,
      firstName: backend.prenom,
      lastName: backend.nom,
      email: backend.email,
      isActive: backend.estActif,
      role: backend.role as any,
      createdAt: new Date(backend.createdAt),
      updatedAt: new Date(backend.updatedAt || backend.createdAt)
    };
  }

  // ============================================
  // ÉTUDIANT
  // ============================================
  
  static toStudent(backend: BackendEtudiant): SimpleStudent {
    return {
      id: backend.id,
      matricule: backend.matricule,
      idCarte: backend.idCarte || '',
      firstName: backend.prenom,
      lastName: backend.nom,
      email: backend.email,
      classId: backend.classe_id || '',
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toStudents(backend: BackendEtudiant[]): SimpleStudent[] {
    return backend.map(e => this.toStudent(e));
  }

  // ============================================
  // ENSEIGNANT
  // ============================================
  
  static toTeacher(backend: BackendEnseignant): SimpleTeacher {
    return {
      id: backend.id,
      firstName: backend.prenom,
      lastName: backend.nom,
      email: backend.email,
      specialization: backend.specialite || '',
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toTeachers(backend: BackendEnseignant[]): SimpleTeacher[] {
    return backend.map(e => this.toTeacher(e));
  }

  // ============================================
  // ADMINISTRATEUR
  // ============================================
  
  static toAdministrator(backend: BackendAdministrateur): SimpleAdministrator {
    return {
      id: backend.id,
      profileUrl: backend.profil || '',
      userId: backend.id,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  // ============================================
  // ANNÉE ACADÉMIQUE
  // ============================================
  
  static toAcademicYear(backend: BackendAnneeAcademique): SimpleAcademicYear {
    return {
      id: backend.id,
      label: backend.libelle,
      startDate: new Date(backend.dateDebut),
      endDate: new Date(backend.dateFin),
      isCurrent: backend.estCourante,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toAcademicYears(backend: BackendAnneeAcademique[]): SimpleAcademicYear[] {
    return backend.map(a => this.toAcademicYear(a));
  }

  // ============================================
  // SEMESTRE
  // ============================================
  
  static toSemester(backend: BackendSemestre): SimpleSemester {
    return {
      id: backend.id,
      name: backend.nom,
      number: backend.numero,
      startDate: new Date(backend.dateDebut),
      endDate: new Date(backend.dateFin),
      academicYearId: backend.annee_academique_id,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toSemesters(backend: BackendSemestre[]): SimpleSemester[] {
    return backend.map(s => this.toSemester(s));
  }

  // ============================================
  // CLASSE
  // ============================================
  
  static toClass(backend: BackendClasse): SimpleClass {
    return {
      id: backend.id,
      name: backend.nom,
      level: backend.niveau,
      academicYearId: backend.annee_academique_id || '',
      schoolId: backend.ecole_id || '',
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toClasses(backend: BackendClasse[]): SimpleClass[] {
    return backend.map(c => this.toClass(c));
  }

  // ============================================
  // COURS
  // ============================================
  
  static toCourse(backend: BackendCours): SimpleCourse {
    return {
      id: backend.id,
      code: backend.code,
      name: backend.nom,
      isArchived: backend.estArchive,
      academicYearId: backend.annee_academique_id || '',
      teacherId: backend.enseignant_id || '',
      semesterId: backend.semestre_id || '',
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toCourses(backend: BackendCours[]): SimpleCourse[] {
    return backend.map(c => this.toCourse(c));
  }

  // ============================================
  // ÉCOLE
  // ============================================
  
  static toSchool(backend: BackendEcole): SimpleSchool {
    return {
      id: backend.id,
      name: backend.nom,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toSchools(backend: BackendEcole[]): SimpleSchool[] {
    return backend.map(s => this.toSchool(s));
  }

  // ============================================
  // ÉVALUATION
  // ============================================
  
  static toEvaluation(backend: BackendEvaluation): SimpleEvaluation {
    return {
      id: backend.id,
      title: backend.titre,
      description: backend.description || '',
      startDate: new Date(backend.dateDebut),
      endDate: backend.dateFin ? new Date(backend.dateFin) : new Date(),
      publicationDate: backend.datePublication ? new Date(backend.datePublication) : new Date(),
      type: backend.typeEvaluation,
      status: backend.statut,
      courseId: backend.cours_id || '',
      quizId: backend.Quizz?.id || '',
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toEvaluations(backend: BackendEvaluation[]): SimpleEvaluation[] {
    return backend.map(e => this.toEvaluation(e));
  }

  // ============================================
  // QUIZ
  // ============================================
  
  static toQuiz(backend: BackendQuizz): SimpleQuiz {
    return {
      id: backend.id,
      title: backend.titre,
      instructions: backend.instructions || '',
      evaluationId: backend.evaluation_id,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  // ============================================
  // QUESTION
  // ============================================
  
  static toQuestion(backend: BackendQuestion): SimpleQuestion {
    return {
      id: backend.id,
      quizId: backend.quizz_id,
      statement: backend.enonce,
      type: backend.typeQuestion,
      options: backend.options || [],
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toQuestions(backend: BackendQuestion[]): SimpleQuestion[] {
    return backend.map(q => this.toQuestion(q));
  }

  // ============================================
  // SESSION RÉPONSE
  // ============================================
  
  static toQuizSession(backend: BackendSessionReponse): SimpleQuizSession {
    return {
      id: backend.id,
      anonymousToken: backend.tokenAnonyme,
      status: backend.statut,
      startDate: new Date(backend.dateDebut),
      endDate: backend.dateFin ? new Date(backend.dateFin) : new Date(),
      evaluationId: backend.quizz_id,
      studentId: backend.etudiant_id,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toQuizSessions(backend: BackendSessionReponse[]): SimpleQuizSession[] {
    return backend.map(s => this.toQuizSession(s));
  }

  // ============================================
  // RÉPONSE ÉTUDIANT
  // ============================================
  
  static toStudentAnswer(backend: BackendReponseEtudiant): SimpleStudentAnswer {
    return {
      id: backend.id,
      content: backend.contenu,
      questionId: backend.question_id,
      sessionId: backend.session_reponse_id,
      createdAt: new Date(backend.createdAt || new Date().toISOString()),
      updatedAt: new Date(backend.updatedAt || new Date().toISOString())
    };
  }

  static toStudentAnswers(backend: BackendReponseEtudiant[]): SimpleStudentAnswer[] {
    return backend.map(a => this.toStudentAnswer(a));
  }

  // ============================================
  // NOTIFICATION
  // ============================================
  
  static toNotification(backend: BackendNotification): SimpleNotification {
    return {
      id: backend.id,
      userId: backend.evaluation_id || '',
      title: backend.titre,
      message: backend.message,
      type: backend.typeNotification,
      createdAt: new Date(backend.createdAt),
      updatedAt: new Date(backend.updatedAt || backend.createdAt)
    };
  }

  static toNotifications(backend: BackendNotification[]): SimpleNotification[] {
    return backend.map(n => this.toNotification(n));
  }

  // ============================================
  // DASHBOARD
  // ============================================
  
  static toDashboard(backend: BackendDashboardAdmin): SimpleDashboard {
    return {
      statistics: {
        totalStudents: backend.statistiques.totalEtudiants,
        totalTeachers: backend.statistiques.totalEnseignants,
        totalClasses: backend.statistiques.totalClasses,
        totalEvaluations: backend.statistiques.totalEvaluations,
        ongoingEvaluations: backend.statistiques.evaluationsEnCours,
        completedEvaluations: backend.statistiques.evaluationsTerminees
      },
      recentEvaluations: backend.evaluationsRecentes?.map(e => this.toEvaluation(e)) || [],
      recentActivities: backend.activitesRecentes || []
    };
  }

  // ============================================
  // RAPPORT
  // ============================================
  
  static toReport(backend: BackendRapport): SimpleReport {
    return {
      evaluation: this.toEvaluation(backend.evaluation),
      statistics: {
        totalParticipants: backend.statistiques.totalParticipants,
        participationRate: backend.statistiques.tauxParticipation,
        averageScore: backend.statistiques.moyenneGenerale,
        successRate: backend.statistiques.tauxReussite
      },
      answers: backend.reponses || [],
      analyses: backend.analyses || []
    };
  }
}

