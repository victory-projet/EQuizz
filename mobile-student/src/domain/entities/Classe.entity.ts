/**
 * Entité Classe - Représente une classe
 */
export interface Classe {
  id: string;
  nom: string;
  Ecole?: {
    nom: string;
  };
  Niveau?: {
    nom: string;
  };
}
