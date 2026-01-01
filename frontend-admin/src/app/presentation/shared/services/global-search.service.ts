import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface SearchConfig {
  placeholder: string;
  suggestions: string[];
  onSearch: (query: string) => void;
  onClear?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private searchQuery = signal('');
  private currentConfig = signal<SearchConfig | null>(null);
  private searchSubject = new Subject<string>();

  // Observable pour les composants qui veulent écouter les recherches
  search$ = this.searchSubject.asObservable();

  constructor(private router: Router) {}

  // Configuration par défaut selon la route
  getDefaultConfig(route: string): SearchConfig {
    const configs: { [key: string]: SearchConfig } = {
      '/dashboard': {
        placeholder: 'Rechercher dans le tableau de bord...',
        suggestions: ['évaluations récentes', 'statistiques', 'notifications'],
        onSearch: (query) => this.performGlobalSearch(query)
      },
      '/evaluations': {
        placeholder: 'Rechercher un quiz par titre, UE ou classe...',
        suggestions: ['Programmation Web', 'Mathématiques', 'ING4ISI', 'BROUILLON'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/courses': {
        placeholder: 'Rechercher un cours ou UE...',
        suggestions: ['Programmation', 'Mathématiques', 'Physique', 'Anglais'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/classes': {
        placeholder: 'Rechercher une classe...',
        suggestions: ['ING4ISI', 'ING3ISI', 'ING2ISI', 'ING1ISI'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/students': {
        placeholder: 'Rechercher un étudiant par nom, email ou classe...',
        suggestions: ['Dupont', 'Martin', 'ING4ISI', 'actif'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/teachers': {
        placeholder: 'Rechercher un enseignant par nom ou email...',
        suggestions: ['Professeur', 'Docteur', 'actif', 'inactif'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/users': {
        placeholder: 'Rechercher un administrateur...',
        suggestions: ['admin', 'actif', 'inactif'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/associations': {
        placeholder: 'Rechercher une association cours-classe...',
        suggestions: ['Programmation', 'ING4ISI', 'actif'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/academic-years': {
        placeholder: 'Rechercher une année académique ou semestre...',
        suggestions: ['2024-2025', 'Semestre 1', 'Semestre 2', 'actif'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/reports': {
        placeholder: 'Rechercher dans les rapports...',
        suggestions: ['évaluation', 'participation', 'mensuel', 'annuel'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/messages': {
        placeholder: 'Rechercher dans les messages...',
        suggestions: ['évaluation', 'maintenance', 'erreur', 'non lu'],
        onSearch: (query) => this.searchSubject.next(query)
      },
      '/profile': {
        placeholder: 'Rechercher dans le profil...',
        suggestions: ['informations', 'compte', 'paramètres'],
        onSearch: (query) => this.performGlobalSearch(query)
      }
    };

    return configs[route] || {
      placeholder: 'Rechercher...',
      suggestions: [],
      onSearch: (query) => this.performGlobalSearch(query)
    };
  }

  // Méthode pour configurer la recherche depuis un composant
  setSearchConfig(config: SearchConfig): void {
    this.currentConfig.set(config);
  }

  // Méthode pour obtenir la configuration actuelle
  getCurrentConfig(): SearchConfig | null {
    return this.currentConfig();
  }

  // Méthode pour obtenir la configuration par défaut selon la route
  getConfigForRoute(route: string): SearchConfig {
    const current = this.currentConfig();
    return current || this.getDefaultConfig(route);
  }

  // Méthode pour effectuer une recherche globale
  private performGlobalSearch(query: string): void {
    if (!query.trim()) return;

    // Logique de recherche globale - peut rediriger vers une page de résultats
    console.log('Recherche globale:', query);
    
    // Exemple : redirection vers une page de résultats de recherche
    // this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  // Méthode pour nettoyer la configuration
  clearConfig(): void {
    this.currentConfig.set(null);
  }

  // Getters pour les signaux
  getSearchQuery() {
    return this.searchQuery();
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }
}