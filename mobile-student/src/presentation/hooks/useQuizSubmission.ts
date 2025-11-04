import { useState } from 'react';
import { QuizSubmission } from '../../domain/entities/Question.entity';
import DIContainer from '../../core/di/container';

export const useQuizSubmission = () => {
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const submitQuizUseCase = DIContainer.getInstance().getSubmitQuizUseCase();

    const submitQuiz = async (submission: QuizSubmission) => {
        try {
            setSubmitting(true);
            setError(null);
            setSuccess(false);
            const result = await submitQuizUseCase.execute(submission);
            setSuccess(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission';
            setError(errorMessage);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return { submitQuiz, submitting, error, success };
};
