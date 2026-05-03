export type UserRole = 'admin' | 'member';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;       // User id
  members: string[];       // Array of user ids
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignedTo: string;      // User id
  status: TaskStatus;
  deadline?: string;       // ISO date string YYYY-MM-DD
  createdBy: string;       // User id
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
