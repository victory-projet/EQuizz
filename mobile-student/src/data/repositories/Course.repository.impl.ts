import { ICourseRepository } from '../../domain/repositories/ICourse.repository';
import { Course } from '../../domain/entities/Course.entity';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';
import apiClient from '../../core/api';
import axios from 'axios';

export class CourseRepositoryImpl implements ICourseRepository {
    async getCourses(): Promise<Course[]> {
        try {
            const response = await apiClient.get<Course[]>('/student/courses');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                } else if (error.response) {
                    const message = error.response.data?.message || 'Erreur lors de la récupération des cours';
                    throw new Error(message);
                } else if (error.request) {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            throw new Error('Une erreur inattendue est survenue');
        }
    }

    async getCourseById(id: string): Promise<Course | null> {
        try {
            const response = await apiClient.get<Course>(`/student/courses/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return null;
                } else if (error.response?.status === 401) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                } else if (error.response) {
                    const message = error.response.data?.message || 'Erreur lors de la récupération du cours';
                    throw new Error(message);
                } else if (error.request) {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            throw new Error('Une erreur inattendue est survenue');
        }
    }

    async getEvaluationPeriod(): Promise<EvaluationPeriod> {
        try {
            const response = await apiClient.get<EvaluationPeriod>('/student/evaluation-period');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                } else if (error.response) {
                    const message = error.response.data?.message || 'Erreur lors de la récupération de la période d\'évaluation';
                    throw new Error(message);
                } else if (error.request) {
                    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
                }
            }
            throw new Error('Une erreur inattendue est survenue');
        }
    }
}
