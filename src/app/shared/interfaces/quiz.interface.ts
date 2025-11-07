// src/app/shared/interfaces/quiz.interface.ts

export type QuestionType = 'multiple' | 'close' | 'open';
export type QuizStatus = 'draft' | 'active' | 'completed' | 'closed';
export type QuizType = 'mi-parcours' | 'fin-semestre' | 'fin-annee';

export interface Quiz {
  id: string;
  title: string;
  status: QuizStatus;
  ue: string;
  ueId?: string;                    // ID de l'UE pour la relation
  questionsCount: number;
  questions?: Question[];           // Liste des questions du quiz
  participation: {
    current: number;
    total: number;
    rate: number;
  };
  classes: string[];
  classIds?: string[];              // IDs des classes pour la relation
  createdAt: Date;
  updatedAt?: Date;                 // Date de dernière modification
  endDate: Date;
  type: QuizType;
  duration?: number;                // Durée en minutes
  passingScore?: number;            // Score minimum pour réussir (pourcentage)
}

export interface Question {
  id: string;
  quizId: string;                   // ID du quiz parent
  type: QuestionType;
  text: string;
  order: number;                    // Ordre d'affichage de la question
  points: number;
  options?: QuestionOption[];       // Options pour les QCM
  correctAnswer?: string | number;  // Réponse correcte (index pour QCM, texte pour fermée)
  explanation?: string;             // Explication de la réponse
  createdAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
}
