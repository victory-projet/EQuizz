import { Question, QuestionType } from '../../../domain/entities/Question.entity';

export const mockQuestions: Question[] = [
    {
        id: 'q1',
        courseId: '1',
        questionNumber: 1,
        totalQuestions: 9,
        text: 'Quelle est la complexité temporelle de l\'algorithme de tri rapide (QuickSort) dans le meilleur cas ?',
        type: QuestionType.SINGLE_CHOICE,
        options: [
            { id: 'q1-opt1', text: 'O(n)' },
            { id: 'q1-opt2', text: 'O(n log n)' },
            { id: 'q1-opt3', text: 'O(n²)' },
            { id: 'q1-opt4', text: 'O(log n)' }
        ]
    },
    {
        id: 'q2',
        courseId: '1',
        questionNumber: 2,
        totalQuestions: 9,
        text: 'Quels sont les principes fondamentaux de la programmation orientée objet ?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
            { id: 'q2-opt1', text: 'Encapsulation' },
            { id: 'q2-opt2', text: 'Héritage' },
            { id: 'q2-opt3', text: 'Polymorphisme' },
            { id: 'q2-opt4', text: 'Compilation' }
        ]
    }
];
