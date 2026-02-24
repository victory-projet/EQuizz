// Domain Entity - User
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  role: 'SUPER-ADMIN' | 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  estActif: boolean;
  ecoleId?: string;  // Pour les administrateurs
  ecole?: {          // Pour les administrateurs
    id: string;
    nom: string;
  };
  dateCreation?: Date;
  dateModification?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin extends User {
  role: 'SUPER-ADMIN' | 'ADMIN';
}

export interface Enseignant extends User {
  role: 'ENSEIGNANT';
  specialite?: string;
  estArchive?: boolean;
}

export interface Etudiant extends User {
  role: 'ETUDIANT';
  classeId?: number;
  classe?: Classe;
  numeroCarteEtudiant?: string;
  estArchive?: boolean;
}

export interface Classe {
  id: number;
  nom: string;
  anneeAcademiqueId: number;
  anneeAcademique?: AnneeAcademique;
  estArchive?: boolean;
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
