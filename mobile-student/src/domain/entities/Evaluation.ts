/**
 * Entité Evaluation - Représente un quizz disponible pour l'étudiant
 * Correspond à la réponse de GET /student/quizzes
 */
export interface Evaluation {
  id: string;
  titre: string;
  dateFin: string;
  Cours: {
    nom: string;
  };
}
