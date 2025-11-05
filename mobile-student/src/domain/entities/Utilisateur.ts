/**
 * Entité Utilisateur - Représente un utilisateur de l'application
 */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: 'etudiant';
  Classe?: {
    nom: string;
    Niveau: {
      nom: string;
    };
  };
  Ecole?: {
    nom: string;
  };
  anneeScolaire?: string;
  avatar?: string;
}
