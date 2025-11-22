import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsData } from '../../../core/models/quiz.interface';
import { StatsGridComponent } from './components/stats-grid/stats-grid.component';
import { ParticipationChartComponent } from './components/participation-chart/participation-chart.component';
import { AlertsPanelComponent } from './components/alerts-panel/alerts-panel.component';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    LoadingSpinnerComponent,
    StatsGridComponent,
    ParticipationChartComponent,
    AlertsPanelComponent,
    RecentActivitiesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  
  analyticsData = signal<AnalyticsData | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.analyticsService.getOverviewData().subscribe({
      next: (data) => {
        this.analyticsData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading.set(false);
      }
    });
  }

  navigateToCreateQuiz(): void {
    this.router.navigate(['/quiz/create']);
  }

  navigateToClasses(): void {
    this.router.navigate(['/classes']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
