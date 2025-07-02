// src/types/task-types.ts

import type { Timestamp } from 'firebase/firestore';

/**
 * ✅ Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * ✅ Task status for filtering and UI
 */
export type TaskStatus = 'pending' | 'inProgress' | 'completed';

/**
 * ✅ Basic task create input
 */
export interface TaskCreate {
  tripId: string;
  title: string;
  description?: string;
  assignedTo?: string[]; // Array of user UIDs
  dueDate?: string; // ISO date
  priority?: TaskPriority;
}

/**
 * ✅ Firestore raw document format
 */
export interface TaskDoc {
  tripId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * ✅ App-facing task (with converted timestamps + Firestore ID)
 */
export interface Task {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

/**
 * ✅ Generic response wrapper
 */
export interface TaskResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errorDetails?: string;
}

/**
 * ✅ Fetch options for filtering tasks
 */
export interface TaskFetchOptions {
  tripId: string;
  assignedTo?: string; // Filter tasks assigned to specific user
  status?: TaskStatus | null; // Filter by status
  priority?: TaskPriority | null; // Filter by priority
}

/**
 * ✅ Pinia store state
 */
export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}
