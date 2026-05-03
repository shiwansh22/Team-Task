import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getProjects,
  getMemberProjects,
  getTasks,
  getMemberTasks,
  getAllUsers,
  createProject as fbCreateProject,
  updateProject as fbUpdateProject,
  deleteProject as fbDeleteProject,
  createTask as fbCreateTask,
  updateTask as fbUpdateTask,
  deleteTask as fbDeleteTask,
  updateUserRole as fbUpdateUserRole,
  deleteUserDoc,
} from '../lib/firestore';
import type { Project, Task, User, UserRole } from '../types';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  users: User[];
  loadingData: boolean;
  refreshAll: () => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTask: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const refreshAll = useCallback(async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const isAdmin = currentUser.role === 'admin';
      const [p, t, u] = await Promise.all([
        isAdmin ? getProjects() : getMemberProjects(currentUser.id),
        isAdmin ? getTasks() : getMemberTasks(currentUser.id),
        isAdmin ? getAllUsers() : Promise.resolve([]),
      ]);
      setProjects(p);
      setTasks(t);
      setUsers(u);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createProject = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    await fbCreateProject(data);
    await refreshAll();
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    await fbUpdateProject(id, data);
    await refreshAll();
  };

  const deleteProject = async (id: string) => {
    await fbDeleteProject(id);
    await refreshAll();
  };

  const createTask = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    await fbCreateTask(data);
    await refreshAll();
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    await fbUpdateTask(id, data);
    await refreshAll();
  };

  const deleteTask = async (id: string) => {
    await fbDeleteTask(id);
    await refreshAll();
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    await fbUpdateUserRole(uid, role);
    await refreshAll();
  };

  const removeUser = async (uid: string) => {
    await deleteUserDoc(uid);
    await refreshAll();
  };

  return (
    <DataContext.Provider
      value={{
        projects, tasks, users, loadingData, refreshAll,
        createProject, updateProject, deleteProject,
        createTask, updateTask, deleteTask,
        updateUserRole, removeUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
