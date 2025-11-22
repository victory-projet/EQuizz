import { Injectable, inject, Type, ComponentRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Configuration générique pour les modals
 */
export interface ModalConfig<T = any> {
  component: Type<any>;
  data?: T;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  disableClose?: boolean;
  panelClass?: string | string[];
  hasBackdrop?: boolean;
  backdropClass?: string;
}

/**
 * Résultat d'un modal
 */
export interface ModalResult<T = any> {
  action: 'confirm' | 'cancel' | 'close';
  data?: T;
  confirmed?: boolean;
}

/**
 * Configuration par défaut pour les modals
 */
const DEFAULT_MODAL_CONFIG: Partial<MatDialogConfig> = {
  width: '600px',
  maxWidth: '90vw',
  disableClose: false,
  hasBackdrop: true,
  panelClass: 'custom-modal-panel'
};

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private dialog = inject(MatDialog);

  /**
   * Ouvre un modal générique avec configuration personnalisée
   */
  open<T, R>(config: ModalConfig<T>): Observable<ModalResult<R>> {
    const dialogConfig: MatDialogConfig = {
      ...DEFAULT_MODAL_CONFIG,
      width: config.width,
      height: config.height,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      disableClose: config.disableClose,
      panelClass: config.panelClass,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      data: config.data
    };

    const dialogRef = this.dialog.open(config.component, dialogConfig);
    
    return dialogRef.afterClosed().pipe(
      map(result => result || { action: 'close' })
    );
  }

  /**
   * Ouvre un modal pour créer une nouvelle entité
   */
  openCreateModal<T>(component: Type<any>, data?: any): Observable<T | null> {
    const dialogRef = this.dialog.open(component, {
      ...DEFAULT_MODAL_CONFIG,
      data: { ...data, isEditMode: false }
    });

    return dialogRef.afterClosed().pipe(
      map(result => {
        if (result && result.action === 'confirm') {
          return result.data;
        }
        return null;
      })
    );
  }

  /**
   * Ouvre un modal pour éditer une entité existante
   */
  openEditModal<T>(component: Type<any>, entity: T): Observable<T | null> {
    const dialogRef = this.dialog.open(component, {
      ...DEFAULT_MODAL_CONFIG,
      data: { ...entity, isEditMode: true }
    });

    return dialogRef.afterClosed().pipe(
      map(result => {
        if (result && result.action === 'confirm') {
          return result.data;
        }
        return null;
      })
    );
  }

  /**
   * Ouvre un modal de confirmation pour suppression
   */
  openDeleteModal(entityName: string, entityTitle: string): Observable<boolean> {
    return this.openConfirmation({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer cette ressource ?`,
      entityName: entityTitle,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      isDangerous: true
    });
  }

  /**
   * Affiche un modal de confirmation générique
   */
  confirm(title: string, message: string, isDangerous: boolean = false): Promise<boolean> {
    return new Promise((resolve) => {
      this.openConfirmation({
        title,
        message,
        entityName: '',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        isDangerous
      }).subscribe(confirmed => {
        resolve(confirmed);
      });
    });
  }

  /**
   * Ouvre un modal de confirmation avec configuration personnalisée
   */
  private openConfirmation(data: any): Observable<boolean> {
    // Import dynamique pour éviter les dépendances circulaires
    return new Observable(observer => {
      import('../../presentation/shared/components/confirmation-modal/confirmation-modal.component')
        .then(({ ConfirmationModalComponent }) => {
          const dialogRef = this.dialog.open(ConfirmationModalComponent, {
            ...DEFAULT_MODAL_CONFIG,
            width: '500px',
            data
          });

          dialogRef.afterClosed().subscribe(result => {
            observer.next(result?.confirmed || false);
            observer.complete();
          });
        });
    });
  }

  /**
   * Affiche un modal d'alerte
   */
  alert(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      this.openConfirmation({
        title,
        message,
        entityName: '',
        confirmText: 'OK',
        cancelText: '',
        isDangerous: false
      }).subscribe(() => {
        resolve();
      });
    });
  }

  /**
   * Ferme tous les modals ouverts
   */
  closeAll(): void {
    this.dialog.closeAll();
  }

  /**
   * Retourne la référence du modal actuellement ouvert
   */
  getOpenDialogs(): MatDialogRef<any>[] {
    return this.dialog.openDialogs;
  }
}
