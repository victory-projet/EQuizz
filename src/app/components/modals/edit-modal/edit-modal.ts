import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="edit-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>Modifier le Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <form [formGroup]="editForm" class="edit-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre du quiz</mat-label>
            <input matInput formControlName="title" placeholder="Entrez le titre">
            <mat-error *ngIf="editForm.get('title')?.hasError('required')">
              Le titre est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Unité d'Enseignement (UE)</mat-label>
            <input matInput formControlName="ue" placeholder="Entrez l'UE">
            <mat-error *ngIf="editForm.get('ue')?.hasError('required')">
              L'UE est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type d'évaluation</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Mi-parcours">Mi-parcours</mat-option>
              <mat-option value="Fin de semestre">Fin de semestre</mat-option>
              <mat-option value="Fin de parcours">Fin de parcours</mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('type')?.hasError('required')">
              Le type est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de fin</mat-label>
            <input matInput type="date" formControlName="endDate">
            <mat-error *ngIf="editForm.get('endDate')?.hasError('required')">
              La date de fin est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Classes</mat-label>
            <input matInput formControlName="classes" placeholder="Ex: L1 Info A, L1 Info B">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre de questions</mat-label>
            <input matInput type="number" formControlName="questions" placeholder="Nombre de questions">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="!editForm.valid">
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-modal-container {
      width: 800px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .modal-content {
      padding: 24px;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class EditModalComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quiz: any }
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      title: [this.data.quiz.title || '', Validators.required],
      ue: [this.data.quiz.ue || '', Validators.required],
      type: [this.data.quiz.type || '', Validators.required],
      endDate: [this.data.quiz.endDate || '', Validators.required],
      classes: [this.data.quiz.classes?.join(', ') || ''],
      questions: [this.data.quiz.questions || 0]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      const updatedQuiz = {
        ...this.data.quiz,
        ...formValue,
        classes: formValue.classes ? formValue.classes.split(',').map((c: string) => c.trim()) : []
      };
      this.dialogRef.close(updatedQuiz);
    }
  }
}
