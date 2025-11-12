// src/app/core/models/student.interface.ts

export interface Student {
  id: string;
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: Date;
  enrollmentDate: Date;
  academicYearId: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile extends Student {
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
}
