// src/app/core/models/teacher.interface.ts

export interface Teacher {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  specialization?: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile extends Teacher {
  bio?: string;
  qualifications?: string[];
  officeLocation?: string;
  officeHours?: string;
}
