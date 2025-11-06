// src/app/shared/interfaces/quiz.interface.ts
export interface Quiz {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed' | 'closed';
  ue: string;
  questionsCount: number;
  participation: {
    current: number;
    total: number;
    rate: number;
  };
  classes: string[];
  createdAt: Date;
  endDate: Date;
  type: 'mi-parcours' | 'fin-semestre' | 'fin-annee';
}

export interface Question {
  id: string;
  type: 'multiple' | 'close' | 'open';
  text: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}
