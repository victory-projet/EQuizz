import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './quiz-stats.html',
  styleUrls: ['./quiz-stats.scss']
})
export class QuizStatsComponent {
  stats = [
    {
      title: 'TotalQuiz',
      value: 24,
      trend: '+3 ce mois',
      icon: 'quiz',
      trendPositive: true
    },
    {
      title: 'Quiz actifs',
      value: 8,
      label: 'En cours',
      icon: 'play_circle'
    },
    {
      title: 'Taux de participation',
      value: '+12%',
      trend: '+12% vs mois dernier',
      icon: 'trending_up',
      trendPositive: true
    },
    {
      title: 'Brouillons',
      value: 5,
      label: 'À finaliser',
      icon: 'drafts'
    }
  ];
}
