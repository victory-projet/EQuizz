import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Composants
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../shared/components/header/header';
import { StatsGrid } from './components/stats-grid/stats-grid';
import { ParticipationChartComponent } from './components/participation-chart/participation-chart';
import { EvaluationChartComponent } from './components/evaluation-chart/evaluation-chart';
import { AlertsPanelComponent } from './components/alerts-panel/alerts-panel';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities';

// Interfaces
import { StatCard, Alert, Activity } from '../../shared/interfaces/dashboard.interface';

// Services
import { DashboardService } from '../../core/services/dashboard.service';
import { ModalService } from '../../core/services/modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    SidebarComponent,
    HeaderComponent,
    StatsGrid,
    ParticipationChartComponent,
    EvaluationChartComponent,
    AlertsPanelComponent,
    RecentActivitiesComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [];
  alerts: Alert[] = [];
  activities: Activity[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getStats().subscribe(stats => {
      this.stats = stats;
    });

    this.dashboardService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });

    this.dashboardService.getActivities().subscribe(activities => {
      this.activities = activities;
    });
  }

  setFilter(filter: string): void {
    // Implémentez la logique de filtrage ici
    console.log('Filter selected:', filter);
  }

  onEditQuiz(quiz: any): void {
    this.modalService.openEdit(quiz).subscribe(result => {
      if (result) {
        console.log('Quiz modifié:', result);
        // Mettre à jour les données
        this.loadDashboardData();
      }
    });
  }

  onPublishQuiz(quiz: any): void {
    this.modalService.openPublish(quiz).subscribe(result => {
      if (result?.confirmed) {
        console.log('Quiz publié:', quiz);
        // Mettre à jour les données
        this.loadDashboardData();
      }
    });
  }

  onDeleteQuiz(quiz: any): void {
    this.modalService.openDelete(quiz).subscribe(result => {
      if (result?.confirmed) {
        console.log('Quiz supprimé:', quiz);
        // Mettre à jour les données
        this.loadDashboardData();
      }
    });
  }

  onPreviewQuiz(quiz: any): void {
    this.modalService.openPreview(quiz).subscribe(() => {
      console.log('Prévisualisation fermée');
    });
  }

  onCreateQuiz(): void {
    this.router.navigate(['/quiz-management', 'create']);
  }

  navigateToQuizManagement(): void {
    this.router.navigate(['/quiz-management']);
  }

  navigateToEvaluation(): void {
    this.router.navigate(['/evaluation']);
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'En cours':
        return 'primary';
      case 'Brouillon':
        return 'accent';
      case 'Clôturé':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
