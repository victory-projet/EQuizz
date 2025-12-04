// Domain Entity - Teacher
export interface Teacher {
  id: string | number;
  specialite?: string;
  utilisateurId: string | number;
  nom?: string;
  prenom?: string;
  email?: string;
  estActif?: boolean;
  dateCreation?: Date;
  dateModification?: Date;
}
