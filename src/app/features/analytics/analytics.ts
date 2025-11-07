import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatIconModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class AnalyticsComponent {
  activeTab = 0;

  overallStats = {
    totalQuizzes: 45,
    totalParticipants: 1250,
    averageScore: 72,
    completionRate: 85
  };

  recentActivity = [
    { action: 'Quiz créé', details: 'Évaluation Algorithmique', time: '2 heures ago' },
    { action: 'Quiz publié', details: 'Base de Données Avancée', time: '5 heures ago' },
    { action: 'Résultats analysés', details: 'Réseaux Informatiques', time: '1 jour ago' }
  ];
}
