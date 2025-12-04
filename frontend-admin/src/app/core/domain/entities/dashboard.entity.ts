// Domain Entity - Dashboard
export interface DashboardStats {
  totalEvaluations: number;
  evaluationsPubliees: number;
  evaluationsEnCours: number;
  evaluationsCloturees: number;
  totalEtudiants: number;
  totalEnseignants: number;
  tauxParticipationGlobal: number;
}

export interface EvaluationRepartition {
  brouillon: number;
  publiee: number;
  cloturee: number;
}

export interface ParticipationParClasse {
  classeNom: string;
  tauxParticipation: number;
}

export interface EvaluationParEnseignant {
  enseignantNom: string;
  nombreEvaluations: number;
}

export interface SentimentAnalysis {
  positif: number;
  neutre: number;
  negatif: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  repartitionEvaluations: EvaluationRepartition;
  participationParClasse: ParticipationParClasse[];
  evaluationsParEnseignant: EvaluationParEnseignant[];
  sentimentGlobal: SentimentAnalysis;
  motsClefs: { mot: string; frequence: number }[];
}
