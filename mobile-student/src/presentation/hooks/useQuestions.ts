import { useState, useEffect } from 'react';
import { Question } from '../../domain/entities/Question.entity';
import DIContainer from '../../core/di/container';

export const useQuestions = (courseId: string) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getQuestionsUseCase = DIContainer.getInstance().getGetQuestionsUseCase();

    useEffect(() => {
        if (courseId) {
            loadQuestions();
        }
    }, [courseId]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getQuestionsUseCase.execute(courseId);
            setQuestions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return { questions, loading, error, refetch: loadQuestions };
};
