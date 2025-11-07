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
            <input matInput formControlName="title" placeholder="Ex: Évaluation Mi-parcours - Algorithmique">
            <mat-error *ngIf="createForm.get('title')?.hasError('required')">
              Le titre est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Unité d'Enseignement (UE)</mat-label>
            <input matInput formControlName="ue" placeholder="Ex: Algorithmique et Programmation">
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
            <mat-error *ngIf="createForm.get('type')?.hasError('required')">
              Le type est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de fin</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="createForm.get('endDate')?.hasError('required')">
              La date de fin est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Classes</mat-label>
            <input matInput formControlName="classes" placeholder="Ex: L1 Info A, L1 Info B">
            <mat-hint>Séparez les classes par des virgules</mat-hint>
            <mat-error *ngIf="createForm.get('classes')?.hasError('required')">
              Au moins une classe est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre de questions</mat-label>
            <input matInput type="number" formControlName="questions" placeholder="Ex: 15" min="1">
            <mat-error *ngIf="createForm.get('questions')?.hasError('required')">
              Le nombre de questions est requis
            </mat-error>
            <mat-error *ngIf="createForm.get('questions')?.hasError('min')">
              Au moins 1 question est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut initial</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Brouillon">Brouillon</mat-option>
              <mat-option value="En cours">Publier immédiatement</mat-option>
            </mat-select>
          </mat-form-field>
        </form>

        <div class="info-box">
          <mat-icon>info</mat-icon>
          <p>Vous pourrez ajouter les questions après la création du quiz.</p>
        </div>
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

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      margin-top: 16px;
    }

    .info-box mat-icon {
      color: #2196f3;
      margin-top: 2px;
    }

    .info-box p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
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
      questions: [0, [Validators.required, Validators.min(1)]],
      status: ['Brouillon']
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
        id: Date.now() // Temporaire, sera remplacé par l'ID du backend
      };
      this.dialogRef.close(newQuiz);
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day} ${this.getMonthName(d.getMonth())} ${year}`;
  }

  private getMonthName(month: number): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month];
  }
}
