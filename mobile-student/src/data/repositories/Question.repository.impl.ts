import { IQuestionRepository } from '../../domain/repositories/IQuestion.repository';
import { Question, QuizSubmission } from '../../domain/entities/Question.entity';
import apiClient from '../../core/api';
import axios from 'axios';

export class QuestionRepositoryImpl implements IQuestionRepository {
    async getQuestionsByCourse(courseId: string): Promise<Question[]> {
        try {
            const response = await apiClient.get<Question[]>(`/student/courses/${courseId}/questions`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                } else if (error.response?.status === 404) {
                    throw new Error('Cours non trouvé');
                } else if (error.response) {
                    const message = error.response.data?.message || 'Erreur lors de la récupération des questions';
                    throw new Error(message);
                } else if (error.request) {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            throw new Error('Une erreur inattendue est survenue');
        }
    }

    async submitQuiz(submission: QuizSubmission): Promise<boolean> {
        try {
            await apiClient.post(`/student/courses/${submission.courseId}/submit`, {
                answers: submission.answers,
                completedAt: submission.completedAt
            });
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                } else if (error.response?.status === 404) {
                    throw new Error('Cours non trouvé');
                } else if (error.response) {
                    const message = error.response.data?.message || 'Erreur lors de la soumission du quiz';
                    throw new Error(message);
                } else if (error.request) {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            throw new Error('Une erreur inattendue est survenue');
        }
    }
}
