/**
 * Entité Utilisateur - Représente un utilisateur de l'application
 */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'etudiant';
}
