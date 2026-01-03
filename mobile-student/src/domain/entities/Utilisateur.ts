/**
 * Entité Utilisateur - Représente un utilisateur de l'application
 */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;  // Optionnel car peut ne pas être retourné par le login
  role: 'etudiant' | 'ETUDIANT';
  classe?: {
    id: string;
    nom: string;
    niveau: string;
  };
  ecole?: {
    nom: string;
  };
  anneeScolaire?: string;
  avatar?: string;
  estActif?: boolean;
  idCarte?: string | null;
  
  // Champs additionnels pour l'étudiant
  Etudiant?: {
    matricule: string;
    classe_id: string;
  };

  // Support pour l'ancienne structure (rétrocompatibilité)
  Classe?: {
    nom: string;
    Niveau?: {
      nom: string;
    };
  };
  Ecole?: {
    nom: string;
  };
}
