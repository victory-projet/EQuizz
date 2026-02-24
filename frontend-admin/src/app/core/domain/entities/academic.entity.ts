// Domain Entity - Academic
// Updated: Added estArchive property to Classe interface
// Force recompilation timestamp: 2026-02-22T09:07:00
export interface AnneeAcademique {
  id: string | number;
  libelle: string;
  dateDebut: Date;
  dateFin: Date;
  estCourante: boolean;
  dateCreation: Date;
  dateModification: Date;
}

export interface Semestre {
  id: string | number;
  libelle: string;
  numero: number;
  dateDebut: Date;
  dateFin: Date;
  anneeAcademiqueId: string | number;
  anneeAcademique?: AnneeAcademique;
  dateCreation: Date;
  dateModification: Date;
}

export interface Cours {
  id: string | number;
  code: string;
  nom: string;
  description?: string;
  estArchive: boolean;
  enseignantId?: string | number;
  enseignant?: {
    id: string | number;
    Utilisateur?: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
  Enseignant?: {
    id: string | number;
    specialite?: string;
    Utilisateur?: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
  dateCreation: Date;
  dateModification: Date;
}

export interface Classe {
  id: string | number;
  nom: string;
  niveau?: string;
  anneeAcademiqueId?: string | number;
  anneeAcademique?: AnneeAcademique;
  ecoleId?: string | number;
  Ecole?: Ecole;
  cours?: Cours[];
  etudiants?: any[];
  estArchive?: boolean;
  dateCreation: Date;
  dateModification: Date;
}

export interface Ecole {
  id: string | number;
  nom: string;
  dateImport?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
