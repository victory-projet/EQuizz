import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-class-modal',
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
    <div class="class-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>{{ isEditMode ? 'Modifier' : 'Ajouter' }} une Classe</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <form [formGroup]="classForm" class="class-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de la classe</mat-label>
            <input matInput formControlName="name" placeholder="Ex: L1 Info A">
            <mat-error *ngIf="classForm.get('name')?.hasError('required')">
              Le nom est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Niveau</mat-label>
            <mat-select formControlName="level">
              <mat-option value="Licence 1">Licence 1</mat-option>
              <mat-option value="Licence 2">Licence 2</mat-option>
              <mat-option value="Licence 3">Licence 3</mat-option>
              <mat-option value="Master 1">Master 1</mat-option>
              <mat-option value="Master 2">Master 2</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre d'étudiants</mat-label>
            <input matInput type="number" formControlName="studentCount" min="0">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Année académique</mat-label>
            <input matInput formControlName="academicYear" placeholder="Ex: 2024-2025">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="!classForm.valid">
          <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          {{ isEditMode ? 'Enregistrer' : 'Ajouter' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .class-modal-container {
      width: 500px;
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
    }

    .class-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class ClassModalComponent implements OnInit {
  classForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.classForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      level: [this.data?.level || '', Validators.required],
      studentCount: [this.data?.studentCount || 0, [Validators.required, Validators.min(0)]],
      academicYear: [this.data?.academicYear || '2024-2025', Validators.required]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.classForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.classForm.value,
        id: this.data?.id || Date.now().toString()
      });
    }
  }
}
