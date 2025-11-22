// src/app/core/models/evaluation-type.interface.ts

export interface EvaluationType {
  id: string;
  name: string;
  code: string;
  description?: string;
  weight: number; // Poids dans la note finale (en pourcentage)
  color?: string; // Couleur pour l'affichage
  icon?: string; // Icône pour l'affichage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types d'évaluation prédéfinis
export enum EvaluationTypeCode {
  QUIZ = 'quiz',
  EXAM = 'exam',
  MIDTERM = 'midterm',
  FINAL = 'final',
  HOMEWORK = 'homework',
  PROJECT = 'project',
  PRESENTATION = 'presentation',
  PARTICIPATION = 'participation',
  LAB = 'lab',
  ASSIGNMENT = 'assignment'
}

// Configuration par défaut des types d'évaluation
export const DEFAULT_EVALUATION_TYPES: Partial<EvaluationType>[] = [
  {
    name: 'Quiz',
    code: EvaluationTypeCode.QUIZ,
    description: 'Évaluation courte et rapide',
    weight: 10,
    color: '#4f46e5',
    icon: '📝'
  },
  {
    name: 'Examen',
    code: EvaluationTypeCode.EXAM,
    description: 'Évaluation complète',
    weight: 30,
    color: '#dc2626',
    icon: '📋'
  },
  {
    name: 'Examen de mi-session',
    code: EvaluationTypeCode.MIDTERM,
    description: 'Évaluation de mi-parcours',
    weight: 25,
    color: '#ea580c',
    icon: '📊'
  },
  {
    name: 'Examen final',
    code: EvaluationTypeCode.FINAL,
    description: 'Évaluation finale du cours',
    weight: 40,
    color: '#b91c1c',
    icon: '🎓'
  },
  {
    name: 'Devoir',
    code: EvaluationTypeCode.HOMEWORK,
    description: 'Travail à faire à la maison',
    weight: 15,
    color: '#16a34a',
    icon: '📚'
  },
  {
    name: 'Projet',
    code: EvaluationTypeCode.PROJECT,
    description: 'Projet de groupe ou individuel',
    weight: 30,
    color: '#9333ea',
    icon: '🚀'
  },
  {
    name: 'Présentation',
    code: EvaluationTypeCode.PRESENTATION,
    description: 'Présentation orale',
    weight: 20,
    color: '#0891b2',
    icon: '🎤'
  },
  {
    name: 'Participation',
    code: EvaluationTypeCode.PARTICIPATION,
    description: 'Participation en classe',
    weight: 10,
    color: '#65a30d',
    icon: '✋'
  },
  {
    name: 'Travaux pratiques',
    code: EvaluationTypeCode.LAB,
    description: 'Travaux en laboratoire',
    weight: 20,
    color: '#0284c7',
    icon: '🔬'
  },
  {
    name: 'Assignation',
    code: EvaluationTypeCode.ASSIGNMENT,
    description: 'Travail assigné',
    weight: 15,
    color: '#7c3aed',
    icon: '📄'
  }
];
