import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, Task, User, TaskStatus } from '../types';

// ─── Collections ────────────────────────────────────────────────────────────
const usersCol = collection(db, 'users');
const projectsCol = collection(db, 'projects');
const tasksCol = collection(db, 'tasks');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toDate = (ts: Timestamp | string | undefined): string => {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  return ts.toDate().toISOString().split('T')[0];
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUserDoc = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id: snap.id, name: d.name, email: d.email, role: d.role, createdAt: toDate(d.createdAt) };
};

export const createUserDoc = async (uid: string, data: Omit<User, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'users'), { ...data, uid, createdAt: serverTimestamp() });
  // Use setDoc so we can use uid as document id
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });
};

export const getAllUsers = async (): Promise<User[]> => {
  const snap = await getDocs(usersCol);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, name: data.name, email: data.email, role: data.role, createdAt: toDate(data.createdAt) };
  });
};

export const updateUserRole = async (uid: string, role: 'admin' | 'member') => {
  await updateDoc(doc(db, 'users', uid), { role });
};

export const deleteUserDoc = async (uid: string) => {
  await deleteDoc(doc(db, 'users', uid));
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = async (): Promise<Project[]> => {
  const snap = await getDocs(query(projectsCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      description: data.description ?? '',
      createdBy: data.createdBy,
      members: data.members ?? [],
      createdAt: toDate(data.createdAt),
    };
  });
};

export const getMemberProjects = async (uid: string): Promise<Project[]> => {
  const snap = await getDocs(query(projectsCol, where('members', 'array-contains', uid)));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      description: data.description ?? '',
      createdBy: data.createdBy,
      members: data.members ?? [],
      createdAt: toDate(data.createdAt),
    };
  });
};

export const createProject = async (data: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
  const ref = await addDoc(projectsCol, { ...data, createdAt: serverTimestamp() });
  return ref.id;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  await updateDoc(doc(db, 'projects', id), data);
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, 'projects', id));
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const getTasks = async (): Promise<Task[]> => {
  const snap = await getDocs(query(tasksCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description ?? '',
      projectId: data.projectId,
      assignedTo: data.assignedTo,
      status: data.status as TaskStatus,
      deadline: data.deadline ?? '',
      createdBy: data.createdBy,
      createdAt: toDate(data.createdAt),
    };
  });
};

export const getMemberTasks = async (uid: string): Promise<Task[]> => {
  const snap = await getDocs(query(tasksCol, where('assignedTo', '==', uid), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description ?? '',
      projectId: data.projectId,
      assignedTo: data.assignedTo,
      status: data.status as TaskStatus,
      deadline: data.deadline ?? '',
      createdBy: data.createdBy,
      createdAt: toDate(data.createdAt),
    };
  });
};

export const createTask = async (data: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  const ref = await addDoc(tasksCol, { ...data, createdAt: serverTimestamp() });
  return ref.id;
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  await updateDoc(doc(db, 'tasks', id), data);
};

export const deleteTask = async (id: string) => {
  await deleteDoc(doc(db, 'tasks', id));
};
