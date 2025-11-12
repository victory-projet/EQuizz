// src/app/core/models/class.interface.ts

export interface Class {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
  teacherId: string;
  capacity: number;
  enrolledStudents: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ClassStudent {
  id: string;
  classId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'active' | 'inactive' | 'withdrawn';
}

export interface ClassTeacher {
  id: string;
  classId: string;
  teacherId: string;
  assignedAt: Date;
  role: 'primary' | 'assistant';
}
