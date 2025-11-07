import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
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
            <input matInput formControlName="title">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Unité d'Enseignement (UE)</mat-label>
            <input matInput formControlName="ue">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type d'évaluation</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Mi-parcours">Mi-parcours</mat-option>
              <mat-option value="Fin de semestre">Fin de semestre</mat-option>
              <mat-option value="Fin de parcours">Fin de parcours</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Brouillon">Brouillon</mat-option>
              <mat-option value="En cours">En cours</mat-option>
              <mat-option value="Clôturé">Clôturé</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="!editForm.valid">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-modal-container {
      width: 600px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class EditModalComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      title: [this.data.title, Validators.required],
      ue: [this.data.ue, Validators.required],
      type: [this.data.type, Validators.required],
      status: [this.data.status, Validators.required]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.editForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.editForm.value
      });
    }
  }
}
