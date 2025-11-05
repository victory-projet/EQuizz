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
  Cours: {
    nom: string;
  };
  Classes?: Array<{
    nom: string;
  }>;
}
