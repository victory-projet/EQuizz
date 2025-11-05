import { useState, useEffect } from 'react';
import { Course } from '../../domain/entities/Course.entity';
import DIContainer from '../../core/di/container';

export const useCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getCoursesUseCase = DIContainer.getInstance().getGetCoursesUseCase();

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCoursesUseCase.execute();
            console.log('Courses loaded:', data);
            setCourses(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            console.error('Error loading courses:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { courses, loading, error, refetch: loadCourses };
};
