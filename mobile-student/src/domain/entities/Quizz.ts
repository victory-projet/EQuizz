/**
 * Entité Quizz - Représente le détail complet d'un quizz avec ses questions
 * Correspond à la réponse de GET /student/quizzes/:id
 */

export enum TypeQuestion {
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
  REPONSE_OUVERTE = 'REPONSE_OUVERTE',
}

export interface QuizzQuestion {
  id: string;
  enonce: string;
  typeQuestion: TypeQuestion;
  options?: string[];
}

export interface Quizz {
  id: string;
  titre: string;
  Questions: QuizzQuestion[];
}

/**
 * Structure pour la soumission des réponses
 */
export interface QuizzAnswer {
  question_id: string;
  contenu: string;
}

export interface QuizzSubmission {
  reponses: QuizzAnswer[];
}
