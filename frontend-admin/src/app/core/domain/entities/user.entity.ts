// Domain Entity - User
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  estActif: boolean;
  dateCreation: Date;
  dateModification: Date;
}

export interface Admin extends User {
  role: 'ADMIN';
}

export interface Enseignant extends User {
  role: 'ENSEIGNANT';
  specialite?: string;
}

export interface Etudiant extends User {
  role: 'ETUDIANT';
  classeId?: number | string;  // Support des IDs numériques et UUID
  classe?: Classe;
  numeroCarteEtudiant?: string;
}

export interface Classe {
  id: number;
  nom: string;
  anneeAcademiqueId: number;
  anneeAcademique?: AnneeAcademique;
  dateCreation: Date;
  dateModification: Date;
}

export interface AnneeAcademique {
  id: number;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
  estActive: boolean;
  dateCreation: Date;
  dateModification: Date;
}
