// Domain Entity - User
export interface User {
  id: string;
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
  classeId?: string;
  classe?: Classe;
  numeroCarteEtudiant?: string;
}

export interface Classe {
  id: string;
  nom: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  dateCreation: Date;
  dateModification: Date;
}

export interface AnneeAcademique {
  id: string;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
  estActive: boolean;
  dateCreation: Date;
  dateModification: Date;
}
