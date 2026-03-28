export interface QuizHistoryEntry {
  id: string;               // ID de la soumission (local ou distant)
  quizzId: string;
  evaluationId: string;
  titre: string;
  coursNom?: string;
  classeNom?: string;
  ecoleNom?: string;
  anneeScolaire?: string;
  nombreQuestions?: number;
  nombreReponses: number;
  completedAt: string;      // Date de soumission
  synced: boolean;          // Synchronisé avec le serveur
  source: 'local' | 'server'; // Origine de la donnée
}
