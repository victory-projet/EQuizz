// Interfaces pour les réponses du backend

// ============================================
// RÉPONSE GÉNÉRIQUE
// ============================================

export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// AUTHENTIFICATION
// ============================================

export interface BackendAuthResponse {
  token: string;
  user: BackendUser;
}

export interface BackendUser {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  estActif: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// ANNÉE ACADÉMIQUE
// ============================================

export interface BackendAnneeAcademique {
  id: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  estActive: boolean;
  semestres?: BackendSemestre[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSemestre {
  id: number;
  nom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  anneeAcademiqueId: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// CLASSE
// ============================================

export interface BackendClasse {
  id: number;
  nom: string;
  niveau: string;
  anneeAcademiqueId: number;
  etudiants?: BackendEtudiant[];
  cours?: BackendCours[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEtudiant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  numeroEtudiant: string;
  classeId?: number;
  utilisateurId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// COURS
// ============================================

export interface BackendCours {
  id: number;
  code: string;
  nom: string;
  description?: string;
  enseignantId?: number;
  anneeAcademiqueId: number;
  semestreId?: number;
  enseignant?: BackendEnseignant;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEnseignant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  departement?: string;
  utilisateurId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// ÉCOLE
// ============================================

export interface BackendEcole {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// ÉVALUATION / QUIZ
// ============================================

export interface BackendEvaluation {
  id: number;
  titre: string;
  description?: string;
  coursId: number;
  classeId?: number;
  dateDebut: string;
  dateFin?: string;
  duree?: number;
  statut: string;
  quizz?: BackendQuizz;
  cours?: BackendCours;
  classe?: BackendClasse;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendQuizz {
  id: number;
  evaluationId: number;
  questions?: BackendQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendQuestion {
  id: number;
  quizzId: number;
  type: string;
  texte: string;
  points: number;
  ordre: number;
  reponses?: BackendReponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendReponse {
  id: number;
  questionId: number;
  texte: string;
  estCorrecte: boolean;
  ordre: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// DASHBOARD
// ============================================

export interface BackendDashboardAdmin {
  statistiques: {
    totalEtudiants: number;
    totalEnseignants: number;
    totalClasses: number;
    totalEvaluations: number;
    evaluationsEnCours: number;
    evaluationsTerminees: number;
  };
  evaluationsRecentes?: BackendEvaluation[];
  activitesRecentes?: any[];
}

// ============================================
// RAPPORT
// ============================================

export interface BackendRapport {
  evaluation: BackendEvaluation;
  statistiques: {
    totalParticipants: number;
    tauxParticipation: number;
    moyenneGenerale: number;
    tauxReussite: number;
  };
  reponses?: any[];
  analyses?: any[];
}

// ============================================
// NOTIFICATION
// ============================================

export interface BackendNotification {
  id: number;
  utilisateurId: number;
  titre: string;
  message: string;
  type: string;
  estLue: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// REQUÊTES (Pour POST/PUT)
// ============================================

export interface BackendLoginRequest {
  email: string;
  motDePasse: string;
}

export interface BackendAnneeAcademiqueRequest {
  nom: string;
  dateDebut: string;
  dateFin: string;
  estActive?: boolean;
}

export interface BackendSemestreRequest {
  nom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  anneeAcademiqueId: number;
}

export interface BackendClasseRequest {
  nom: string;
  niveau: string;
  anneeAcademiqueId: number;
}

export interface BackendCoursRequest {
  code: string;
  nom: string;
  description?: string;
  enseignantId?: number;
  anneeAcademiqueId: number;
  semestreId?: number;
}

export interface BackendEvaluationRequest {
  titre: string;
  description?: string;
  coursId: number;
  classeId?: number;
  dateDebut: string;
  dateFin?: string;
  duree?: number;
  statut?: string;
}

export interface BackendQuestionRequest {
  type: string;
  texte: string;
  points: number;
  ordre: number;
  reponses?: {
    texte: string;
    estCorrecte: boolean;
    ordre: number;
  }[];
}
