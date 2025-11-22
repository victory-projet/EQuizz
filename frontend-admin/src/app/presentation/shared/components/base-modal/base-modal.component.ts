import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModalResult } from '../../../../core/services/modal.service';

/**
 * Composant modal de base abstrait pour les opérations CRUD
 * Fournit la logique commune pour création et édition d'entités
 */
@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: '', // Les classes dérivées fourniront leur propre template
  styles: []
})
export abstract class BaseModalComponent<T> implements OnInit {
  protected fb = inject(FormBuilder);
  
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  constructor(
    protected dialogRef: MatDialogRef<BaseModalComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public injectedData?: T & { isEditMode?: boolean }
  ) {}

  ngOnInit(): void {
    this.form = this.buildForm();
    this.isEditMode = this.injectedData?.isEditMode || false;
    
    if (this.isEditMode && this.injectedData) {
      this.form.patchValue(this.injectedData);
    }
  }

  /**
   * Construit le formulaire avec les validations
   * Doit être implémenté par les classes dérivées
   */
  abstract buildForm(): FormGroup;

  /**
   * Retourne le titre du modal
   * Doit être implémenté par les classes dérivées
   */
  abstract getTitle(): string;

  /**
   * Retourne le label du bouton de soumission
   * Doit être implémenté par les classes dérivées
   */
  abstract getSubmitLabel(): string;

  /**
   * Soumet le formulaire si valide
   */
  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const result: ModalResult<T> = {
        action: 'confirm',
        data: this.form.value
      };
      
      this.dialogRef.close(result);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Annule et ferme le modal
   */
  onCancel(): void {
    const result: ModalResult = {
      action: 'cancel'
    };
    this.dialogRef.close(result);
  }

  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.form.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Retourne le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Email invalide';
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} caractères`;
    }
    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    }
    if (errors['min']) return `Valeur minimale: ${errors['min'].min}`;
    if (errors['max']) return `Valeur maximale: ${errors['max'].max}`;
    if (errors['pattern']) return 'Format invalide';
    
    return 'Champ invalide';
  }
}
