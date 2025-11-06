import { Course } from '../../../domain/entities/Course.entity';
import { EvaluationPeriod } from '../../../domain/entities/EvaluationPeriod.entity';
import { API_CONFIG, API_ENDPOINTS } from '../../../core/constants/api.constants';

export class CourseApiDataSource {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    async fetchCourses(): Promise<Course[]> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.COURSES}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async fetchCourseById(id: string): Promise<Course> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.COURSES}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch course: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    async fetchEvaluationPeriod(): Promise<EvaluationPeriod> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.EVALUATION_PERIOD}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch evaluation period: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }
}
