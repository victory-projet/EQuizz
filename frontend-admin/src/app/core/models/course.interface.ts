// src/app/core/models/course.interface.ts

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  academicYearId: string;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CourseClass {
  id: string;
  courseId: string;
  classId: string;
  semester: number;
  year: number;
}
