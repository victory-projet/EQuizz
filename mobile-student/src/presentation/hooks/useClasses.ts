import { useState, useEffect } from 'react';
import type { Classe } from '../../domain/entities/Classe.entity';
import DIContainer from '../../core/di/container';

export const useClasses = () => {
    const [classes, setClasses] = useState<Classe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getClassesUseCase = DIContainer.getInstance().getGetClassesUseCase();

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getClassesUseCase.execute();
            setClasses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return { classes, loading, error, refetch: loadClasses };
};
