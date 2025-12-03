export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  role: 'etudiant' | 'enseignant' | 'admin';
  classe?: {
    id: string;
    nom: string;
    niveau?: string;
  };
  ecole?: {
    id: string;
    nom: string;
  };
  anneeAcademique?: {
    id: string;
    nom: string;
  };
  avatar?: string;

  // Champs additionnels pour l'étudiant (nested object from backend if present, though we mapped top level)
  // Backend returns top level fields, but might also return Etudiant object if we didn't filter it out.
  // Based on auth.controller.js, we return a constructed object, so Etudiant object is NOT returned.
  // So we don't need Etudiant here.
}
