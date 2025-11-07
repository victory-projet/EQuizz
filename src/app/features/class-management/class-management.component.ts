import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../core/services/class.service';
import { Class } from '../../shared/interfaces/class.interface';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-class-management',
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
  templateUrl: './class-management.component.html',
  styleUrls: ['./class-management.component.scss']
})
export class ClassManagementComponent implements OnInit {
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  searchTerm = '';
  isLoading = true;

  constructor(
    private classService: ClassService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoading = true;
    this.classService.getClasses().subscribe(classes => {
      this.classes = classes;
      this.filteredClasses = classes;
      this.isLoading = false;
    });
  }

  onSearch(): void {
    this.filteredClasses = this.classService.searchClasses(this.searchTerm);
  }

  showEditForm(classData: Class): void {
    // TODO: Ouvrir un modal d'édition
    console.log('Modifier la classe:', classData);
  }

  deleteClass(classData: Class): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer la classe',
        message: `Êtes-vous sûr de vouloir supprimer "${classData.name}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.classService.deleteClass(classData.id);
        this.loadClasses();
      }
    });
  }
}
