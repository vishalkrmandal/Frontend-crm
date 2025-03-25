// types/auth.ts
export type UserRole = 'student' | 'staff' | 'admin' | 'director';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}