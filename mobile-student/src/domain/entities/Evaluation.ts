/**
 * Entité Evaluation - Représente un quizz disponible pour l'étudiant
 * Correspond à la réponse de GET /student/quizzes
 */
export interface Evaluation {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut?: 'En cours' | 'À venir' | 'Terminé';
  nombreQuestions?: number;
  Cours?: {
    nom: string;
  };
  Cour?: {  // L'API retourne parfois "Cour" au lieu de "Cours"
    nom: string;
    code?: string;
  };
  Classes?: Array<{
    nom: string;
  }>;
  Quizz?: {
    id: string;
    titre?: string;
    instructions?: string;
  };
}
