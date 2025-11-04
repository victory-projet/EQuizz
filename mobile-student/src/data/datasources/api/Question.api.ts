import { Question, QuizSubmission } from '../../../domain/entities/Question.entity';
import { API_CONFIG, API_ENDPOINTS } from '../../../core/constants/api.constants';

export class QuestionApiDataSource {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    async fetchQuestionsByCourse(courseId: string): Promise<Question[]> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.QUESTIONS}?courseId=${courseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async submitQuiz(submission: QuizSubmission): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SUBMIT_QUIZ}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submission)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit quiz: ${response.statusText}`);
        }

        const data = await response.json();
        return data.success;
    }
}
