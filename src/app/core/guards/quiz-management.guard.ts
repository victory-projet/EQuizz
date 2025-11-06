// src/app/core/guards/quiz-management.guard.ts
import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { QuizService } from '../services/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizManagementGuard implements CanActivate {
  private quizService = inject(QuizService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const quizId = route.params['id'];

    if (quizId) {
      // Vérifier si l'utilisateur peut accéder à ce quiz spécifique
      const quiz = this.quizService.getQuizById(quizId);

      if (!quiz) {
        // Quiz non trouvé
        this.router.navigate(['/quizzes']);
        return false;
      }

      // Vérifier les permissions selon le statut du quiz
      if (this.isQuizRestricted(quiz)) {
        this.router.navigate(['/quizzes']);
        return false;
      }
    }

    return true;
  }

  private isQuizRestricted(quiz: any): boolean {
    // Logique de restriction selon le statut du quiz
    const userRole = this.getUserRole();

    if (userRole === 'teacher' && quiz.status === 'published') {
      return true; // Les enseignants ne peuvent pas modifier les quiz publiés
    }

    return false;
  }

  private getUserRole(): string {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData).role : 'student';
  }
}
