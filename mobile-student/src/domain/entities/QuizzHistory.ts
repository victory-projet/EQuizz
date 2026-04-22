/**
 * Entité QuizzHistory - Représente un quizz terminé dans l'historique global de l'étudiant
 * Correspond à la réponse de GET /student/quizzes/history
 * L'historique inclut TOUS les quizz passés, même dans d'anciens établissements
 */
export interface QuizzHistory {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  dateFinSession?: string | null;  // Date à laquelle l'étudiant a soumis
  nombreQuestions?: number;
  score?: number | null;           // Score obtenu (si disponible)
  scoreMax?: number | null;        // Score maximum possible
  Cours?: {
    nom: string;
    code?: string;
  };
  Cour?: {
    nom: string;
    code?: string;
  };
  Etablissement?: {
    id: string;
    nom: string;
  };
  Classes?: Array<{
    nom: string;
  }>;
}
