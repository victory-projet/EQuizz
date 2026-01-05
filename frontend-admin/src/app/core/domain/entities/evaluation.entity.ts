import { Question } from './question.entity';

export interface EvaluationApiData {
  id?: string | number;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  coursId: string | number;
  classeIds?: (string | number)[];
  classeId?: string | number;
  statut: 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE' | 'ACTIVE' | 'TERMINEE' | 'ARCHIVEE';
  dateCreation?: string;
  createdAt?: string;
  updatedAt?: string;
  administrateur_id?: string | number;
  cours_id?: string | number;
  quizzId?: string | number;
}

export interface Evaluation extends EvaluationApiData {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
  dateCreation?: string;
  
  // Relations
  cours?: {
    id: string | number;
    nom: string;
  };
  classe?: {
    id: string | number;
    nom: string;
  };
  Classes?: Array<{
    id: string | number;
    nom: string;
  }>;
  Cour?: {
    id: string | number;
    nom: string;
  };
  Cours?: {
    id: string | number;
    nom: string;
  };
  quizz?: Quizz;
  Quizz?: Quizz;
}

export interface Quizz {
  id: number | string;
  titre: string;
  description?: string;
  instructions?: string;
  evaluationId?: number | string;
  questions?: Question[];
  Questions?: Question[];
  dateCreation?: Date;
  dateModification?: Date;
}

export interface EvaluationQuestion {
  id?: string;
  evaluationId: string;
  question: string;
  type: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE';
  options?: string[];
  bonneReponse?: string | number;
  points: number;
  ordre: number;
}

export interface EvaluationSubmission {
  id?: string;
  evaluationId: string;
  userId: string;
  reponses: { [questionId: string]: any };
  score?: number;
  dateSubmission: string;
  dureeReponse?: number; // en secondes
}

export interface EvaluationResult {
  id?: string;
  evaluationId: string;
  userId: string;
  score: number;
  maxScore: number;
  pourcentage: number;
  dateEvaluation: string;
  dureeReponse: number;
  details: {
    questionId: string;
    reponseUtilisateur: any;
    bonneReponse: any;
    points: number;
    pointsObtenus: number;
  }[];
}