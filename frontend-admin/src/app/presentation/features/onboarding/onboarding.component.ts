import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface OnboardingSlide {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);

  slides: OnboardingSlide[] = [
    {
      title: 'Bienvenue sur EQuizz',
      description: 'La plateforme complète pour gérer et analyser les évaluations des enseignements de votre établissement.',
      image: '/H1.png'
    },
    {
      title: 'Créez des Évaluations',
      description: 'Concevez facilement des questionnaires personnalisés avec différents types de questions : choix multiples, reponses ouvertes.',
      image: '/H2.png'
    },
    {
      title: 'Gérez vos Utilisateurs',
      description: 'Administrez les étudiants, enseignants et classes. Importez des données en masse via Excel pour gagner du temps.',
      image: '/U1.png'
    },
    {
      title: 'Analysez les Résultats',
      description: 'Consultez des rapports détaillés avec graphiques interactifs. Exportez les données en PDF.',
      image: '/U2.png'
    },
    {
      title: 'Prêt à Commencer !',
      description: 'Connectez-vous pour accéder à votre tableau de bord et commencer à créer vos premières évaluations.',
      image: '/U3.png'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Désactiver le scroll sur le body
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Réactiver le scroll quand on quitte le composant
    document.body.style.overflow = '';
  }

  nextSlide(): void {
    if (this.currentSlide() < this.slides.length - 1) {
      this.currentSlide.update(v => v + 1);
    }
  }

  previousSlide(): void {
    if (this.currentSlide() > 0) {
      this.currentSlide.update(v => v - 1);
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  skip(): void {
    this.finish();
  }

  finish(): void {
    localStorage.setItem('hasSeenOnboarding', 'true');
    this.router.navigate(['/login']);
  }
}
