import { Injectable, signal } from '@angular/core';

export interface ConfirmationConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private isOpenSignal = signal(false);
  private configSignal = signal<ConfirmationConfig>({
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir continuer ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'default',
    icon: 'help_outline'
  });

  private resolveCallback: ((result: boolean) => void) | null = null;

  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly config = this.configSignal.asReadonly();

  /**
   * Affiche une boîte de dialogue de confirmation
   * @param config Configuration de la confirmation
   * @returns Promise<boolean> - true si confirmé, false si annulé
   */
  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      this.configSignal.set({
        title: config.title || 'Confirmation',
        message: config.message,
        confirmText: config.confirmText || 'Confirmer',
        cancelText: config.cancelText || 'Annuler',
        type: config.type || 'default',
        icon: config.icon || this.getDefaultIcon(config.type || 'default')
      });
      this.isOpenSignal.set(true);
    });
  }

  /**
   * Confirme l'action
   */
  onConfirm(): void {
    this.isOpenSignal.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(true);
      this.resolveCallback = null;
    }
  }

  /**
   * Annule l'action
   */
  onCancel(): void {
    this.isOpenSignal.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.resolveCallback = null;
    }
  }

  /**
   * Obtient l'icône par défaut selon le type
   */
  private getDefaultIcon(type: string): string {
    switch (type) {
      case 'danger': return 'warning';
      case 'warning': return 'error_outline';
      case 'info': return 'info';
      case 'success': return 'check_circle';
      default: return 'help_outline';
    }
  }

  /**
   * Méthodes de confirmation prédéfinies pour les actions courantes
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la suppression',
      message: itemName 
        ? `Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`
        : 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      icon: 'delete_forever'
    });
  }

  confirmPublish(itemName?: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la publication',
      message: itemName
        ? `Êtes-vous sûr de vouloir publier "${itemName}" ? Les étudiants recevront une notification.`
        : 'Êtes-vous sûr de vouloir publier cet élément ? Les étudiants recevront une notification.',
      confirmText: 'Publier',
      cancelText: 'Annuler',
      type: 'info',
      icon: 'send'
    });
  }

  confirmClose(itemName?: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la clôture',
      message: itemName
        ? `Êtes-vous sûr de vouloir clôturer "${itemName}" ? Les étudiants ne pourront plus répondre.`
        : 'Êtes-vous sûr de vouloir clôturer cet élément ? Les étudiants ne pourront plus répondre.',
      confirmText: 'Clôturer',
      cancelText: 'Annuler',
      type: 'warning',
      icon: 'lock'
    });
  }

  confirmReset(): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la réinitialisation',
      message: 'Êtes-vous sûr de vouloir réinitialiser ? Toutes les modifications non sauvegardées seront perdues.',
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      type: 'warning',
      icon: 'refresh'
    });
  }

  confirmLogout(): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmText: 'Se déconnecter',
      cancelText: 'Annuler',
      type: 'default',
      icon: 'logout'
    });
  }

  confirmActivateUser(userName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer l\'activation',
      message: `Êtes-vous sûr de vouloir activer l'utilisateur "${userName}" ?`,
      confirmText: 'Activer',
      cancelText: 'Annuler',
      type: 'success',
      icon: 'person'
    });
  }

  confirmDeactivateUser(userName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la désactivation',
      message: `Êtes-vous sûr de vouloir désactiver l'utilisateur "${userName}" ?`,
      confirmText: 'Désactiver',
      cancelText: 'Annuler',
      type: 'warning',
      icon: 'person_off'
    });
  }

  confirmPasswordReset(userName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer la réinitialisation',
      message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de "${userName}" ?`,
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      type: 'warning',
      icon: 'lock_reset'
    });
  }

  confirmImport(itemType: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer l\'importation',
      message: `Êtes-vous sûr de vouloir importer ces ${itemType} ? Cette action peut prendre du temps.`,
      confirmText: 'Importer',
      cancelText: 'Annuler',
      type: 'info',
      icon: 'upload_file'
    });
  }

  confirmExport(itemType: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmer l\'exportation',
      message: `Êtes-vous sûr de vouloir exporter ces ${itemType} ?`,
      confirmText: 'Exporter',
      cancelText: 'Annuler',
      type: 'info',
      icon: 'download'
    });
  }
}