// src/app/core/services/quiz-draft.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface QuizDraft {
  id?: string;
  title: string;
  description: string;
  academicYearId: string;
  subjectId: string;
  questions: any[];
  currentStep: 'info' | 'questions' | 'preview';
  lastSaved: Date;
}

@Injectable({
  providedIn: 'root'
})
export class QuizDraftService {
  private readonly STORAGE_KEY = 'quiz_draft';
  private draftSubject = new BehaviorSubject<QuizDraft | null>(this.loadDraft());

  draft$: Observable<QuizDraft | null> = this.draftSubject.asObservable();

  /**
   * Sauvegarder un brouillon dans le localStorage
   */
  saveDraft(draft: QuizDraft): void {
    draft.lastSaved = new Date();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draft));
    this.draftSubject.next(draft);
  }

  /**
   * Charger le brouillon depuis le localStorage
   */
  loadDraft(): QuizDraft | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const draft = JSON.parse(stored);
        // Vérifier si le brouillon n'est pas trop ancien (> 7 jours)
        const lastSaved = new Date(draft.lastSaved);
        const daysSinceLastSave = (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastSave > 7) {
          this.clearDraft();
          return null;
        }
        
        return draft;
      } catch (error) {
        console.error('Error loading draft:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Effacer le brouillon
   */
  clearDraft(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.draftSubject.next(null);
  }

  /**
   * Vérifier si un brouillon existe
   */
  hasDraft(): boolean {
    return this.loadDraft() !== null;
  }

  /**
   * Obtenir le brouillon actuel
   */
  getCurrentDraft(): QuizDraft | null {
    return this.draftSubject.value;
  }
}
