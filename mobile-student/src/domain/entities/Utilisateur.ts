/**
 * Entité Utilisateur - Représente un utilisateur de l'application
 */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;  // Optionnel car peut ne pas être retourné par le login
  role: 'etudiant';
  Classe?: {
    nom: string;
    Niveau?: {
      nom: string;
    };
  };
  Ecole?: {
    nom: string;
  };
  anneeScolaire?: string;
  avatar?: string;
  
  // Champs additionnels pour l'étudiant
  Etudiant?: {
    matricule: string;
    classe_id: string;
  };
}
