import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-create-modal',
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
    <div class="create-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>Créer un Nouveau Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <form [formGroup]="createForm" class="create-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre du quiz</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Évaluation Mi-parcours">
            <mat-error *ngIf="createForm.get('title')?.hasError('required')">
              Le titre est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Unité d'Enseignement (UE)</mat-label>
            <input matInput formControlName="ue" placeholder="Ex: Algorithmique">
            <mat-error *ngIf="createForm.get('ue')?.hasError('required')">
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
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de fin</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Classes</mat-label>
            <input matInput formControlName="classes" placeholder="Ex: L1 Info A, L1 Info B">
            <mat-hint>Séparez les classes par des virgules</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre de questions</mat-label>
            <input matInput type="number" formControlName="questions" min="1">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="create()" [disabled]="!createForm.valid">
          <mat-icon>add</mat-icon>
          Créer le Quiz
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-modal-container {
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

    .create-form {
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
export class CreateModalComponent implements OnInit {
  createForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateModalComponent>
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      ue: ['', Validators.required],
      type: ['', Validators.required],
      endDate: ['', Validators.required],
      classes: ['', Validators.required],
      questions: [1, [Validators.required, Validators.min(1)]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  create(): void {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const newQuiz = {
        ...formValue,
        classes: formValue.classes.split(',').map((c: string) => c.trim()),
        endDate: this.formatDate(formValue.endDate),
        createdDate: this.formatDate(new Date()),
        id: Date.now(),
        status: 'Brouillon'
      };
      this.dialogRef.close(newQuiz);
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}
