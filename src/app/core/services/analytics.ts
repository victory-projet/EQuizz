// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import {
  DashboardStats,
  ParticipationData,
  EvaluationDistribution,
  Alert,
  Activity
} from '../../shared/interfaces/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class Analytics {

  // ✅ Méthode qui existe - pour résoudre l'erreur
  getDashboardStats(): DashboardStats {
    return {
      activeStudents: { value: 1234, trend: 12 },
      courses: { value: 45, trend: 8 },
      publishedQuizzes: { value: 28, trend: 23 },
      ongoingEvaluations: { value: 12, trend: 15 }
    };
  }

  getParticipationData(): ParticipationData {
    return {
      achieved: 75,
      target: 85,
      finSemester: 68,
      finParcours: 82
    };
  }

  getEvaluationDistribution(): EvaluationDistribution {
    return {
      completed: 45,
      onHold: 15,
      inProgress: 25,
      pending: 15
    };
  }

  getRecentActivities(): Activity[] {
    return [
      {
        type: 'Nouveau quizz publié',
        title: 'Algorithmique avancée - Licence 3',
        time: 'Il y a 2 heures'
      },
      {
        type: 'Rapport généré',
        title: 'Base de données - Rapport de fin de semestre',
        time: 'Il y a 4 heures'
      },
      {
        type: 'Évaluation terminée',
        title: 'Réseaux informatiques - Mi-parcours',
        time: 'Il y a 6 heures'
      },
      {
        type: 'Nouveau quizz publié',
        title: 'Algorithmique avancée - Licence 3',
        time: 'Il y a 2 heures'
      }
    ];
  }

  getAlerts(): Alert[] {
    return [
      {
        type: 'warning',
        title: 'Rapport "Base de données"',
        message: 'Votre rapport pour l\'UE Base de données est prêt depuis le 30 Octobre, 2023 | 06:00 PM',
        icon: 'description'
      },
      {
        type: 'error',
        title: 'Participation en chute',
        message: 'Contactez la liste participatoire pour l\'unité #roubi_UE de base de données à 15% après 9.5%',
        icon: 'warning'
      },
      {
        type: 'info',
        title: 'Fin du quota horaire en approche',
        message: 'La matière Analyse financière se termine dans 2h.',
        icon: 'schedule'
      }
    ];
  }

  // Méthodes supplémentaires pour les données de graphiques
  getParticipationChartData() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Taux de participation',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: '#4caf50',
          tension: 0.4
        }
      ]
    };
  }

  getEvaluationDistributionData() {
    return {
      labels: ['Terminé', 'En attente', 'En cours', 'En suspens'],
      datasets: [
        {
          data: [45, 15, 25, 15],
          backgroundColor: [
            '#4caf50',
            '#ff9800',
            '#2196f3',
            '#9e9e9e'
          ]
        }
      ]
    };
  }
}
