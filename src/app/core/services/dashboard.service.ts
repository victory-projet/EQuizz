import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StatCard, Quiz, Alert, Activity } from '../../shared/interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  getStats(): Observable<StatCard[]> {
    return of([
      {
        title: 'Étudiants actifs',
        value: 24,
        change: '+12% ce mois',
        changeType: 'positive',
        icon: '👥'
      },
      {
        title: 'Cours (UE)',
        value: 156,
        change: '+8% ce mois',
        changeType: 'positive',
        icon: '📚'
      },
      {
        title: 'Quizz publiés',
        value: 89,
        change: '+23% le mois dernier',
        changeType: 'positive',
        icon: '📝'
      },
      {
        title: 'Évaluations en cours',
        value: 78,
        change: '+15% ce mois',
        changeType: 'positive',
        icon: '📊'
      }
    ]);
  }

  getAlerts(): Observable<Alert[]> {
    return of([
      {
        id: 1,
        title: 'Rapport "Base de données"',
        details: 'Votre rapport pour #code_UE est prévu depuis 30 Octobre, 2025 | 04:00 PM',
        type: 'warning',
        date: '30 Oct 2025'
      },
      {
        id: 2,
        title: 'Participation en chute !!!',
        details: 'Constat d\'une faible participation pour l\'Unité #code_UE soit Base de Données à 10% (après 3)',
        type: 'error'
      },
      {
        id: 3,
        title: 'Fin du Quota horaires en approche',
        details: 'La matière Analyse financière se termine dans 24H',
        type: 'warning'
      }
    ]);
  }

  getActivities(): Observable<Activity[]> {
    return of([
      {
        id: 1,
        title: 'Nouveau quizz publié',
        details: 'Algorithmique avancée - Licence 3',
        time: 'Il y a 2 heures',
        type: 'quiz',
        icon: '💡'
      },
      {
        id: 2,
        title: 'Nouveau quizz publié',
        details: 'Algorithmique avancée - Licence 3',
        time: 'Il y a 2 heures',
        type: 'quiz',
        icon: '💡'
      }
    ]);
  }

  getQuizzes(): Observable<Quiz[]> {
    return of([
      {
        id: 1,
        title: 'Évaluation Mi-parcours - Algorithmique',
        status: 'En cours',
        ue: 'Algorithmique et Programmation',
        questions: 15,
        participation: { current: 124, total: 150, rate: 83 },
        type: 'Mi-parcours',
        endDate: '30 Sept 2025',
        classes: ['L1 Info A', 'L1 Info B'],
        createdDate: '15 Sept 2025'
      },
      {
        id: 2,
        title: 'Évaluation Fin de Semestre - Base de Données',
        status: 'En cours',
        ue: 'Base de Données',
        questions: 20,
        participation: { current: 45, total: 80, rate: 56 },
        type: 'Fin de semestre',
        endDate: '25 Oct 2025',
        classes: ['L2 Info'],
        createdDate: '10 Oct 2025'
      },
      {
        id: 3,
        title: 'Évaluation Mi-parcours - Réseaux',
        status: 'Brouillon',
        ue: 'Réseaux Informatiques',
        questions: 18,
        type: 'Mi-parcours',
        endDate: '25 Oct 2025',
        classes: ['L3 Info A', 'L3 Info B'],
        createdDate: '12 Oct 2025'
      }
    ]);
  }
}
