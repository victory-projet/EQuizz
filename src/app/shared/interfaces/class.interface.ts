export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  studentCount: number;
  students?: Student[];
  createdAt: Date;
  updatedAt?: Date;
}
