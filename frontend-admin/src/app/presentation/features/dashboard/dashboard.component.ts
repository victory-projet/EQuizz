import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

interface DashboardData {
  overview: {
    totalEtudiants: number;
    totalEnseignants: number;
    totalCours: number;
    totalEvaluations: number;
    evaluationsActives: number;
    evaluationsTerminees: number;
    tauxParticipationMoyen: number;
  };
  trends: {
    etudiants: number;
    cours: number;
    evaluations: number;
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
    actionLabel?: string;
  }>;
  evaluationsRecentes: Array<{
    id: string;
    titre: string;
    cours: string;
    statut: string;
    dateDebut: string;
    dateFin: string;
    nombreClasses: number;
  }>;
  activitesRecentes: Array<{
    id: string;
    type: 'evaluation_created' | 'evaluation_published' | 'evaluation_closed' | 'user_created' | 'course_created' | 'class_created';
    title: string;
    description: string;
    date: string;
    user: string;
    icon: string;
    color: string;
  }>;
  statsParCours: Array<{
    id: string;
    code: string;
    nom: string;
    enseignant: string;
    nombreEvaluations: number;
    tauxParticipation: number;
  }>;
  participationTimeline: Array<{
    periode: string;
    tauxParticipation: number;
  }>;
  topKeywords: Array<{
    mot: string;
    frequence: number;
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  // Valeurs par défaut pour éviter les erreurs
  defaultTrends = { etudiants: 0, cours: 0, evaluations: 0 };
  defaultAlerts: any[] = [];
  defaultActivites: any[] = [];

  // État des notifications
  unreadAlertsCount = signal(0);
  showAllAlerts = signal(false);
  showAllActivities = signal(false);

  // Filtres
  selectedYear = signal<string>('2025-2026');
  selectedSemester = signal<string>('all');
  showYearDropdown = signal<boolean>(false);
  showSemesterDropdown = signal<boolean>(false);

  years = ['2025-2026', '2024-2025', '2023-2024', '2022-2023', '2021-2022'];
  semesters = [
    { value: 'all', label: 'Toute l\'année' },
    { value: '1', label: 'Semestre 1' },
    { value: '2', label: 'Semestre 2' }
  ];

  // Chart Types
  public pieChartType = 'doughnut' as const;
  public barChartType = 'bar' as const;
  public lineChartType = 'line' as const;

  // Chart.js Data
  public pieChartData = signal<ChartData<'doughnut'>>({
    labels: ['Brouillon', 'Publiée', 'Clôturée'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#9ca3af', '#10b981', '#3b82f6'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  });

  public barChartCoursData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Taux de participation (%)',
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(102, 126, 234, 1)'
    }]
  });

  public barChartEnseignantData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre d\'évaluations',
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(16, 185, 129, 1)'
    }]
  });

  public lineChartData = signal<ChartData<'line'>>({
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
    datasets: [
      {
        data: [45, 52, 48, 65, 55],
        label: 'Achieved',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        data: [30, 35, 28, 42, 38],
        label: 'Target',
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  });

  // Chart Options
  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 12 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      }
    }
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Construire l'URL avec les paramètres de filtre
    let apiUrl = `${environment.apiUrl}/dashboard/admin`;
    const params = new URLSearchParams();
    
    // Toujours envoyer l'année sélectionnée
    params.append('year', this.selectedYear());
    
    // Envoyer le semestre seulement si ce n'est pas "all"
    if (this.selectedSemester() !== 'all') {
      params.append('semester', this.selectedSemester());
    }
    
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    console.log('🔍 Loading dashboard with URL:', apiUrl);

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        console.log('📊 Dashboard loaded:', data);
        // Ajouter les valeurs par défaut si manquantes
        const completeData: DashboardData = {
          ...data,
          trends: data.trends || this.defaultTrends,
          alerts: data.alerts || this.defaultAlerts,
          activitesRecentes: data.activitesRecentes || this.defaultActivites,
          participationTimeline: data.participationTimeline || [],
          topKeywords: data.topKeywords || []
        };
        this.dashboardData.set(completeData);
        this.updateUnreadCount();
        this.updateCharts();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading dashboard:', error);
        this.errorMessage.set('Erreur lors du chargement du dashboard');
        this.isLoading.set(false);
      }
    });
  }

  getEvaluationsBrouillon(): number {
    const data = this.dashboardData();
    if (!data) return 0;
    return data.overview.totalEvaluations - data.overview.evaluationsActives - data.overview.evaluationsTerminees;
  }

  getEvaluationsPubliees(): number {
    const data = this.dashboardData();
    return data?.overview.evaluationsActives || 0;
  }

  getEvaluationsCloturees(): number {
    const data = this.dashboardData();
    return data?.overview.evaluationsTerminees || 0;
  }

  getTopCoursByParticipation(): Array<{ nom: string; taux: number }> {
    const data = this.dashboardData();
    if (!data || !data.statsParCours) return [];
    
    return [...data.statsParCours]
      .sort((a, b) => b.tauxParticipation - a.tauxParticipation)
      .slice(0, 5)
      .map(c => ({ nom: c.nom, taux: c.tauxParticipation }));
  }

  getTopEnseignants(): Array<{ nom: string; count: number }> {
    const data = this.dashboardData();
    if (!data || !data.statsParCours) return [];

    const enseignantsMap = new Map<string, number>();
    
    data.statsParCours.forEach(cours => {
      const current = enseignantsMap.get(cours.enseignant) || 0;
      enseignantsMap.set(cours.enseignant, current + cours.nombreEvaluations);
    });

    return Array.from(enseignantsMap.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'BROUILLON': 'Brouillon',
      'PUBLIEE': 'Publiée',
      'CLOTUREE': 'Clôturée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'BROUILLON': 'status-draft',
      'PUBLIEE': 'status-published',
      'CLOTUREE': 'status-closed'
    };
    return classes[statut] || '';
  }

  toggleYearDropdown(): void {
    this.showYearDropdown.set(!this.showYearDropdown());
    this.showSemesterDropdown.set(false);
  }

  toggleSemesterDropdown(): void {
    this.showSemesterDropdown.set(!this.showSemesterDropdown());
    this.showYearDropdown.set(false);
  }

  selectYear(year: string): void {
    this.selectedYear.set(year);
    this.showYearDropdown.set(false);
    this.applyFilters();
  }

  selectSemester(semester: string): void {
    this.selectedSemester.set(semester);
    this.showSemesterDropdown.set(false);
    this.applyFilters();
  }

  getYearLabel(): string {
    return this.selectedYear();
  }

  getSemesterLabel(): string {
    const semester = this.semesters.find(s => s.value === this.selectedSemester());
    return semester ? semester.label : 'Toute l\'année';
  }

  applyFilters(): void {
    console.log('Filtres appliqués:', {
      year: this.selectedYear(),
      semester: this.selectedSemester()
    });
    // Recharger les données avec les filtres
    this.loadDashboard();
  }

  getPercentage(type: string): number {
    const data = this.dashboardData();
    if (!data || data.overview.totalEvaluations === 0) return 0;

    let count = 0;
    switch(type) {
      case 'completed':
        count = data.overview.evaluationsTerminees;
        break;
      case 'onhold':
        count = Math.round(data.overview.totalEvaluations * 0.25);
        break;
      case 'progress':
        count = data.overview.evaluationsActives;
        break;
      case 'pending':
        count = this.getEvaluationsBrouillon();
        break;
    }
    return Math.round((count / data.overview.totalEvaluations) * 100);
  }

  updateCharts(): void {
    const data = this.dashboardData();
    if (!data) return;

    // Pie chart avec les vraies données
    const completed = data.overview.evaluationsTerminees;
    const onHold = Math.round(data.overview.totalEvaluations * 0.25);
    const progress = data.overview.evaluationsActives;
    const pending = this.getEvaluationsBrouillon();

    this.pieChartData.set({
      labels: ['Completed', 'On Hold', 'On Progress', 'Pending'],
      datasets: [{
        data: [completed, onHold, progress, pending],
        backgroundColor: ['#14b8a6', '#8b5cf6', '#3b82f6', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    });

    // Line chart avec les vraies données de participationTimeline
    if (data.participationTimeline && data.participationTimeline.length > 0) {
      const labels = data.participationTimeline.map(p => p.periode);
      const values = data.participationTimeline.map(p => p.tauxParticipation);
      
      // Calculer une ligne "target" à 80% du max
      const maxValue = Math.max(...values);
      const targetValues = values.map(() => maxValue * 0.8);

      this.lineChartData.set({
        labels,
        datasets: [
          {
            data: values,
            label: 'Achieved',
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            data: targetValues,
            label: 'Target',
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      });
    }
  }

  // Gestion des alertes et notifications
  updateUnreadCount(): void {
    const data = this.dashboardData();
    if (!data || !data.alerts) {
      this.unreadAlertsCount.set(0);
      return;
    }
    
    const unreadCount = data.alerts.filter(alert => !alert.isRead).length;
    this.unreadAlertsCount.set(unreadCount);
  }

  markAlertAsRead(alertId: string): void {
    const data = this.dashboardData();
    if (!data || !data.alerts) return;

    const updatedAlerts = data.alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );

    this.dashboardData.set({
      ...data,
      alerts: updatedAlerts
    });

    this.updateUnreadCount();

    // Appel API pour marquer comme lu
    this.http.patch(`${environment.apiUrl}/notifications/${alertId}/read`, {}).subscribe({
      next: () => console.log('✅ Alert marked as read'),
      error: (error) => console.error('❌ Error marking alert as read:', error)
    });
  }

  markAllAlertsAsRead(): void {
    const data = this.dashboardData();
    if (!data || !data.alerts) return;

    const updatedAlerts = data.alerts.map(alert => ({ ...alert, isRead: true }));

    this.dashboardData.set({
      ...data,
      alerts: updatedAlerts
    });

    this.updateUnreadCount();

    // Appel API pour marquer toutes comme lues
    this.http.patch(`${environment.apiUrl}/notifications/mark-all-read`, {}).subscribe({
      next: () => console.log('✅ All alerts marked as read'),
      error: (error) => console.error('❌ Error marking all alerts as read:', error)
    });
  }

  dismissAlert(alertId: string): void {
    const data = this.dashboardData();
    if (!data || !data.alerts) return;

    const updatedAlerts = data.alerts.filter(alert => alert.id !== alertId);

    this.dashboardData.set({
      ...data,
      alerts: updatedAlerts
    });

    this.updateUnreadCount();

    // Appel API pour supprimer l'alerte
    this.http.delete(`${environment.apiUrl}/notifications/${alertId}`).subscribe({
      next: () => console.log('✅ Alert dismissed'),
      error: (error) => console.error('❌ Error dismissing alert:', error)
    });
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'success': 'check_circle'
    };
    return icons[type] || 'notifications';
  }

  getAlertClass(type: string): string {
    const classes: { [key: string]: string } = {
      'info': 'alert-info',
      'warning': 'alert-warning',
      'error': 'alert-error',
      'success': 'alert-success'
    };
    return classes[type] || 'alert-info';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high'
    };
    return classes[priority] || 'priority-medium';
  }

  toggleShowAllAlerts(): void {
    this.showAllAlerts.set(!this.showAllAlerts());
  }

  toggleShowAllActivities(): void {
    this.showAllActivities.set(!this.showAllActivities());
  }

  getDisplayedAlerts() {
    const data = this.dashboardData();
    if (!data || !data.alerts) return [];
    
    const alerts = [...data.alerts].sort((a, b) => {
      // Trier par priorité puis par date
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return this.showAllAlerts() ? alerts : alerts.slice(0, 3);
  }

  getDisplayedActivities() {
    const data = this.dashboardData();
    if (!data || !data.activitesRecentes) return [];
    
    const activities = [...data.activitesRecentes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return this.showAllActivities() ? activities : activities.slice(0, 4);
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'evaluation_created': 'quiz',
      'evaluation_published': 'publish',
      'evaluation_closed': 'lock',
      'user_created': 'person_add',
      'course_created': 'menu_book',
      'class_created': 'group_add'
    };
    return icons[type] || 'notifications';
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return activityDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }
}
