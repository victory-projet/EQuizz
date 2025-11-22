// Mapper pour les quiz/évaluations
import { Quiz, Question, QuestionOption } from '../../core/domain/entities/quiz.entity';
import {
  BackendEvaluation,
  BackendQuestion,
  BackendReponse,
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
    const questions = backend.quizz?.questions?.map(q => this.toQuestion(q)) || [];
    const classIds = backend.classeId ? [backend.classeId.toString()] : [];
    
    return new Quiz(
      backend.id.toString(),
      backend.titre,
      backend.coursId.toString(), // subject
      backend.statut as any, // status
      questions,
      classIds,
      new Date(backend.dateDebut), // createdDate
      backend.dateFin ? new Date(backend.dateFin) : undefined, // endDate
      backend.description || '', // type
      backend.description || '', // description
      '', // semesterId
      '' // academicYearId
    );
  }

  /**
   * Convertir Quiz vers BackendEvaluationRequest
   */
  static toBackendEvaluationRequest(quiz: Quiz): BackendEvaluationRequest {
    return {
      titre: quiz.title,
      description: quiz.description,
      coursId: parseInt(quiz.subject),
      classeId: quiz.classIds.length > 0 ? parseInt(quiz.classIds[0]) : undefined,
      dateDebut: quiz.createdDate.toISOString(),
      dateFin: quiz.endDate?.toISOString(),
      statut: quiz.status
    };
  }

  // ============================================
  // QUESTION
  // ============================================

  /**
   * Convertir BackendQuestion vers Question (Domain)
   */
  static toQuestion(backend: BackendQuestion): Question {
    const options = backend.reponses?.map(r => this.toQuestionOption(r)) || [];
    
    return new Question(
      backend.id.toString(),
      backend.texte,
      backend.type as any,
      backend.points,
      options,
      undefined, // correctAnswer - à déterminer depuis les options
      undefined // explanation
    );
  }

  /**
   * Convertir Question vers BackendQuestionRequest
   */
  static toBackendQuestionRequest(question: Question): BackendQuestionRequest {
    return {
      type: question.type,
      texte: question.text,
      points: question.points,
      ordre: 1, // ordre par défaut
      reponses: question.options.map((opt, index) => ({
        texte: opt.text,
        estCorrecte: opt.isCorrect,
        ordre: index + 1
      }))
    };
  }

  // ============================================
  // OPTION DE QUESTION
  // ============================================

  /**
   * Convertir BackendReponse vers QuestionOption (Domain)
   */
  static toQuestionOption(backend: BackendReponse): QuestionOption {
    return new QuestionOption(
      backend.id.toString(),
      backend.texte,
      backend.estCorrecte
    );
  }
}
