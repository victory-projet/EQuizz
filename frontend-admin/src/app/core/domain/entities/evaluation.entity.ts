// Domain Entity - Evaluation
export interface Evaluation {
  id: number | string;  // Peut être un nombre ou un UUID
  titre: string;
  description?: string;
  dateDebut: Date;
  dateFin: Date;
  statut: 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE';
  coursId: number | string;  // Peut être un nombre ou un UUID
  cours?: any;
  classeId: number | string;  // Peut être un nombre ou un UUID
  classe?: any;
  quizzId?: number | string;  // Peut être un nombre ou un UUID
  quizz?: Quizz;
  dateCreation: Date;
  dateModification: Date;
}

// Interface pour les données d'API (avec dates en string)
export interface EvaluationApiData {
  id?: number | string;
  titre: string;
  description?: string;
  dateDebut: string | Date;
  dateFin: string | Date;
  statut: 'BROUILLON' | 'PUBLIEE' | 'CLOTUREE';
  cours_id?: number | string;
  coursId?: number | string;
  classeIds?: (number | string)[];
  dateCreation?: string | Date;
  dateModification?: string | Date;
}

export interface Quizz {
  id: number | string;  // Peut être un nombre ou un UUID
  titre: string;
  description?: string;
  evaluationId?: number | string;  // Peut être un nombre ou un UUID
  questions?: Question[];
  dateCreation: Date;
  dateModification: Date;
}

export interface Question {
  id: number | string;  // Peut être un nombre ou un UUID
  enonce: string;
  type: 'QCM' | 'ECHELLE' | 'OUI_NON' | 'TEXTE_LIBRE' | 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';  // Support des deux formats
  typeQuestion?: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';  // Format backend
  options?: string[];
  ordre: number;
  quizzId: number | string;  // Peut être un nombre ou un UUID
  dateCreation: Date;
  dateModification: Date;
}

export interface ReponseEtudiant {
  id: number | string;  // Peut être un nombre ou un UUID
  reponse: string;
  questionId: number | string;  // Peut être un nombre ou un UUID
  question?: Question;
  etudiantId: number | string;  // Peut être un nombre ou un UUID
  etudiant?: any;
  sessionReponseId: number | string;  // Peut être un nombre ou un UUID
  dateCreation: Date;
}

export interface SessionReponse {
  id: number | string;  // Peut être un nombre ou un UUID
  evaluationId: number | string;  // Peut être un nombre ou un UUID
  evaluation?: Evaluation;
  etudiantId: number | string;  // Peut être un nombre ou un UUID
  etudiant?: any;
  dateDebut: Date;
  dateFin?: Date;
  estTerminee: boolean;
  reponses?: ReponseEtudiant[];
  dateCreation: Date;
}
