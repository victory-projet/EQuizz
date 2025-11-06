import { useState, useEffect } from 'react';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';
import DIContainer from '../../core/di/container';

export const useEvaluationPeriod = () => {
    const [period, setPeriod] = useState<EvaluationPeriod | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getEvaluationPeriodUseCase = DIContainer.getInstance().getGetEvaluationPeriodUseCase();

    useEffect(() => {
        loadPeriod();
    }, []);

    const loadPeriod = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEvaluationPeriodUseCase.execute();
            console.log('Evaluation period loaded:', data);
            setPeriod(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            console.error('Error loading evaluation period:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { period, loading, error, refetch: loadPeriod };
};
