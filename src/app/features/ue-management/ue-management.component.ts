import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UEService } from '../../core/services/ue.service';
import { UE } from '../../shared/interfaces/ue.interface';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-ue-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    LoadingSkeletonComponent
  ],
  templateUrl: './ue-management.component.html',
  styleUrls: ['./ue-management.component.scss']
})
export class UEManagementComponent implements OnInit {
  ues: UE[] = [];
  filteredUEs: UE[] = [];
  searchTerm = '';
  isLoading = true;
  editingUE: UE | null = null;
  isFormVisible = false;

  ueForm = {
    code: '',
    name: '',
    description: '',
    credits: 5,
    semester: 1
  };

  constructor(
    private ueService: UEService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUEs();
  }

  loadUEs(): void {
    this.isLoading = true;
    this.ueService.getUEs().subscribe(ues => {
      this.ues = ues;
      this.filteredUEs = ues;
      this.isLoading = false;
    });
  }

  onSearch(): void {
    this.filteredUEs = this.ueService.searchUEs(this.searchTerm);
  }

  showCreateForm(): void {
    this.editingUE = null;
    this.resetForm();
    this.isFormVisible = true;
  }

  showEditForm(ue: UE): void {
    this.editingUE = ue;
    this.ueForm = {
      code: ue.code,
      name: ue.name,
      description: ue.description,
      credits: ue.credits,
      semester: ue.semester
    };
    this.isFormVisible = true;
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.editingUE = null;
    this.resetForm();
  }

  saveUE(): void {
    if (this.editingUE) {
      this.ueService.updateUE(this.editingUE.id, this.ueForm);
    } else {
      this.ueService.createUE(this.ueForm);
    }
    this.cancelForm();
  }

  deleteUE(ue: UE): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\'UE',
        message: `Êtes-vous sûr de vouloir supprimer "${ue.name}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ueService.deleteUE(ue.id);
      }
    });
  }

  private resetForm(): void {
    this.ueForm = {
      code: '',
      name: '',
      description: '',
      credits: 5,
      semester: 1
    };
  }
}
