// Domain Entity - Notification
export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCES' | 'AVERTISSEMENT' | 'ERREUR';
  estLue: boolean;
  utilisateurId: number;
  dateCreation: Date;
}
