// Mapper pour les quiz/évaluations
import { Quiz, Question, QuestionOption } from '../../core/domain/entities/quiz.entity';
import {
  BackendEvaluation,
  BackendQuestion,
  BackendEvaluationRequest,
  BackendQuestionRequest
} from '../http/interfaces/backend.interfaces';

export class QuizMapper {
  // ============================================
  // QUIZ / ÉVALUATION
  // ============================================

  /**
   * Convertir BackendEvaluation vers Quiz (Domain)
   */
  static toQuiz(backend: BackendEvaluation): Quiz {
    const questions = backend.Quizz?.Questions?.map((q: BackendQuestion) => this.toQuestion(q)) || [];

    // Extraire les IDs des classes depuis le tableau Classes
    let classIds: string[] = [];
    if (backend.Classes && Array.isArray(backend.Classes)) {
      classIds = backend.Classes.map(c => c.id.toString());
    }

    // Extraire l'ID du cours depuis l'objet Cours ou depuis cours_id
    const courseId = backend.Cours?.id?.toString() || backend.cours_id?.toString() || '';

    // Mapper le statut backend vers le statut frontend
    let status: 'draft' | 'published' | 'active' | 'closed' = 'draft';
    if (backend.statut === 'BROUILLON') status = 'draft';
    else if (backend.statut === 'PUBLIEE') status = 'published';
    else if (backend.statut === 'EN_COURS') status = 'active';
    else if (backend.statut === 'CLOTUREE') status = 'closed';

    return new Quiz(
      backend.id.toString(),
      backend.titre,
      courseId, // subject
      status, // status
      questions,
      classIds,
      new Date(backend.dateDebut), // createdDate
      backend.dateFin ? new Date(backend.dateFin) : undefined, // endDate
      backend.typeEvaluation || 'MI_PARCOURS', // type
      backend.description || '', // description
      '', // semesterId
      '' // academicYearId
    );
  }

  /**
   * Convertir Quiz vers BackendEvaluationRequest
   */
  static toBackendEvaluationRequest(quiz: Quiz): BackendEvaluationRequest {
    // Mapper le statut frontend vers le statut backend
    let statut: 'BROUILLON' | 'PUBLIEE' | 'EN_COURS' | 'CLOTUREE' = 'BROUILLON';
    if (quiz.status === 'draft') statut = 'BROUILLON';
    else if (quiz.status === 'published') statut = 'PUBLIEE';
    else if (quiz.status === 'active') statut = 'EN_COURS';
    else if (quiz.status === 'closed') statut = 'CLOTUREE';

    return {
      titre: quiz.title,
      description: quiz.description,
      cours_id: quiz.subject,
      dateDebut: quiz.createdDate.toISOString(),
      dateFin: quiz.endDate?.toISOString(),
      datePublication: quiz.status === 'published' ? new Date().toISOString() : undefined,
      typeEvaluation: quiz.type as 'MI_PARCOURS' | 'FIN_SEMESTRE',
      statut: statut
    };
  }

  // ============================================
  // QUESTION
  // ============================================

  /**
   * Convertir BackendQuestion vers Question (Domain)
   */
  static toQuestion(backend: BackendQuestion): Question {
    const options = backend.options?.map((opt: any, index: number) =>
      new QuestionOption(
        index.toString(),
        opt.texte || opt.text || '',
        opt.estCorrecte || opt.isCorrect || false
      )
    ) || [];

    return new Question(
      backend.id.toString(),
      backend.enonce,
      backend.typeQuestion as any,
      1, // points par défaut
      options,
      undefined, // correctAnswer - à déterminer depuis les options
      undefined // explanation
    );
  }

  /**
   * Convertir Question vers BackendQuestionRequest
   */
  static toBackendQuestionRequest(question: Question): BackendQuestionRequest {
    // Mapper le type de question frontend vers backend
    let typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE' = 'CHOIX_MULTIPLE';
    if (question.type === 'QCM' || question.type === 'closed') {
      typeQuestion = 'CHOIX_MULTIPLE';
    } else if (question.type === 'open') {
      typeQuestion = 'REPONSE_OUVERTE';
    }

    return {
      enonce: question.text,
      typeQuestion: typeQuestion,
      options: question.options.map((opt, index) => ({
        texte: opt.text,
        estCorrecte: opt.isCorrect,
        ordre: index + 1
      }))
    };
  }
}
