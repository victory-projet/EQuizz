import { TypeQuestion } from "../models/enums/TypeQuestion";
import { Question } from "../models/interfaces/Question";

export const QuestionData: Question[] = [
    {
        id: 'q1',
        courseId: '1', // Algorithmique et Programmation
        questionNumber: 2,
        totalQuestions: 9,
        text: 'Comment évaluez-vous la compréhension des notes de cours donnés par l\'enseignant ?',
        type: TypeQuestion.MULTIPLE,
        options: [
        {
            id: 'opt1',
            text: 'Très claire - Les concepts sont bien expliqués et facile à comprendre'
        },
        {
            id: 'opt2',
            text: 'Claire - Généralement compréhensible avec quelques points à améliorer'
        },
        {
            id: 'opt3',
            text: 'Moyennement claire - Certains concepts nécessitent plus d\'explication'
        },
        {
            id: 'opt4',
            text: 'Peu claire - Difficultés fréquentes à comprendre les explications'
        },
        {
            id: 'opt5',
            text: 'Pas du tout claire - Les explications sont confuses'
        }
        ]
    },
    {
        id: 'q2',
        courseId: '1',
        questionNumber: 3,
        totalQuestions: 9,
        text: 'L\'enseignant utilise-t-il des exemples pratiques pour illustrer les concepts ?',
        type: TypeQuestion.OUVERT,
    },
    {
        id: 'q3',
        courseId: '1',
        questionNumber: 4,
        totalQuestions: 9,
        text: 'Comment évaluez-vous la disponibilité de l\'enseignant pour répondre aux questions ?',
        type: TypeQuestion.OUVERT,
    }
];