// Interfaces pour les réponses du backend
// ⚠️ IMPORTANT: Ces interfaces doivent correspondre EXACTEMENT aux modèles backend
// Les types UUID du backend sont représentés par des strings en TypeScript

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
  id: string;  // ✅ UUID
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
  id: string;  // ✅ UUID
  libelle: string;  // ✅ Nom correct du backend
  dateDebut: string;
  dateFin: string;
  estCourante: boolean;  // ✅ Nom correct du backend
  Semestres?: BackendSemestre[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSemestre {
  id: string;  // ✅ UUID
  nom: string;
  numero: number;  // ✅ Ajouté (1 ou 2)
  dateDebut: string;
  dateFin: string;
  annee_academique_id: string;  // ✅ UUID (snake_case comme backend)
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// CLASSE
// ============================================

export interface BackendClasse {
  id: string;  // ✅ UUID
  nom: string;
  niveau: string;
  annee_academique_id?: string;  // ✅ UUID (snake_case comme backend)
  ecole_id?: string;  // ✅ UUID (snake_case comme backend)
  Etudiants?: BackendEtudiant[];
  Cours?: BackendCours[];
  Ecole?: BackendEcole;
  AnneeAcademique?: BackendAnneeAcademique;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEtudiant {
  id: string;  // ✅ UUID
  prenom: string;
  nom: string;
  email: string;
  matricule: string;  // ✅ Nom correct du backend
  idCarte?: string;  // ✅ Ajouté
  classe_id?: string;  // ✅ UUID (snake_case comme backend)
  Classe?: BackendClasse;
  Utilisateur?: BackendUser;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// COURS
// ============================================

export interface BackendCours {
  id: string;  // ✅ UUID
  code: string;
  nom: string;
  estArchive: boolean;  // ✅ Ajouté
  enseignant_id?: string;  // ✅ UUID (snake_case comme backend)
  annee_academique_id?: string;  // ✅ UUID (snake_case comme backend)
  semestre_id?: string;  // ✅ UUID (snake_case comme backend)
  Enseignant?: BackendEnseignant;
  Semestre?: BackendSemestre;
  AnneeAcademique?: BackendAnneeAcademique;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEnseignant {
  id: string;  // ✅ UUID
  prenom: string;
  nom: string;
  email: string;
  specialite?: string;  // ✅ Nom correct du backend
  Utilisateur?: BackendUser;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// ÉCOLE
// ============================================

export interface BackendEcole {
  id: string;  // ✅ UUID
  nom: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// ÉVALUATION / QUIZ
// ============================================

export interface BackendEvaluation {
  id: string;  // ✅ UUID
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin?: string;
  datePublication?: string;  // ✅ Ajouté
  typeEvaluation: 'MI_PARCOURS' | 'FIN_SEMESTRE';  // ✅ Ajouté
  statut: 'BROUILLON' | 'PUBLIEE' | 'EN_COURS' | 'CLOTUREE';
  cours_id?: string;  // ✅ UUID (snake_case comme backend)
  Cours?: BackendCours;
  Quizz?: BackendQuizz;
  Classes?: BackendClasse[];  // ✅ Relation many-to-many
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendQuizz {
  id: string;  // ✅ UUID
  titre: string;  // ✅ Ajouté
  instructions?: string;  // ✅ Ajouté
  evaluation_id: string;  // ✅ UUID (snake_case comme backend)
  Questions?: BackendQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendQuestion {
  id: string;  // ✅ UUID
  quizz_id: string;  // ✅ UUID (snake_case comme backend)
  enonce: string;  // ✅ Nom correct du backend
  typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';  // ✅ Nom correct
  options?: any[];  // ✅ JSON array
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// RÉPONSES
// ============================================

export interface BackendSessionReponse {
  id: string;  // ✅ UUID
  tokenAnonyme: string;  // ✅ Ajouté
  statut: 'EN_COURS' | 'TERMINE';
  dateDebut: string;
  dateFin?: string;
  quizz_id: string;  // ✅ UUID (snake_case comme backend)
  etudiant_id: string;  // ✅ UUID (snake_case comme backend)
  ReponseEtudiants?: BackendReponseEtudiant[];
  Quizz?: BackendQuizz;
  Etudiant?: BackendEtudiant;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendReponseEtudiant {
  id: string;  // ✅ UUID
  contenu: string;
  question_id: string;  // ✅ UUID (snake_case comme backend)
  session_reponse_id: string;  // ✅ UUID (snake_case comme backend)
  Question?: BackendQuestion;
  SessionReponse?: BackendSessionReponse;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// ADMINISTRATEUR
// ============================================

export interface BackendAdministrateur {
  id: string;  // ✅ UUID
  profil?: string;  // ✅ URL du profil
  Utilisateur?: BackendUser;
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
  id: string;  // ✅ UUID
  evaluation_id?: string;  // ✅ UUID (snake_case comme backend)
  titre: string;
  message: string;
  typeNotification: 'NOUVELLE_EVALUATION' | 'RAPPEL_EVALUATION' | 'EVALUATION_BIENTOT_FERMEE';  // ✅ Nom correct
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
  libelle: string;  // ✅ Nom correct
  dateDebut: string;
  dateFin: string;
  estCourante?: boolean;  // ✅ Nom correct
}

export interface BackendSemestreRequest {
  nom: string;
  numero: number;  // ✅ Ajouté
  dateDebut: string;
  dateFin: string;
  anneeAcademiqueId: string;  // ✅ UUID (camelCase pour request)
}

export interface BackendClasseRequest {
  nom: string;
  niveau: string;
  anneeAcademiqueId: string;  // ✅ UUID (camelCase pour request)
  ecoleId?: string;  // ✅ UUID (camelCase pour request)
}

export interface BackendCoursRequest {
  code: string;
  nom: string;
  estArchive?: boolean;  // ✅ Ajouté
  enseignantId?: string;  // ✅ UUID (camelCase pour request)
  anneeAcademiqueId: string;  // ✅ UUID (camelCase pour request)
  semestreId?: string;  // ✅ UUID (camelCase pour request)
}

export interface BackendEvaluationRequest {
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin?: string;
  datePublication?: string;  // ✅ Ajouté
  typeEvaluation: 'MI_PARCOURS' | 'FIN_SEMESTRE';  // ✅ Ajouté
  statut?: 'BROUILLON' | 'PUBLIEE' | 'EN_COURS' | 'CLOTUREE';
  cours_id: string;  // ✅ UUID (snake_case pour request)
  classeIds?: string[];  // ✅ Array d'UUIDs
}

export interface BackendQuestionRequest {
  enonce: string;  // ✅ Nom correct
  typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';  // ✅ Nom correct
  options?: any[];  // ✅ JSON array
}

