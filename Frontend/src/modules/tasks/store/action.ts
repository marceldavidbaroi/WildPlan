// src/modules/tasks/task-actions.ts

import type { Task, TaskCreate, TaskState, TaskFetchOptions, TaskResponse } from './types';

import * as TaskService from '../service/tasks.service';
import { Timestamp } from 'firebase/firestore';

interface TaskRaw extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp | number;
  updatedAt: Timestamp | number;
}

/**
 * 🔄 Normalize Firestore Timestamps to ms
 */
function normalizeTask(item: TaskRaw): Task {
  return {
    ...item,
    createdAt:
      typeof item.createdAt === 'number'
        ? item.createdAt
        : item.createdAt instanceof Timestamp
          ? item.createdAt.toMillis()
          : Date.now(),
    updatedAt:
      typeof item.updatedAt === 'number'
        ? item.updatedAt
        : item.updatedAt instanceof Timestamp
          ? item.updatedAt.toMillis()
          : Date.now(),
  };
}

/**
 * 📋 Fetch tasks with filters
 */
export async function getTasks(
  this: TaskState,
  options: TaskFetchOptions,
): Promise<TaskResponse<Task[]>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.getTasks(options);

  if (response.success && response.data) {
    const normalized = response.data.map(normalizeTask);
    this.tasks = normalized;
    response.data = normalized;
  } else {
    this.tasks = [];
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ➕ Add a new task
 */
export async function addTask(
  this: TaskState,
  tripId: string,
  data: TaskCreate,
): Promise<TaskResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.addTask(tripId, data);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ✏️ Update a task by ID
 */
export async function updateTask(
  this: TaskState,
  tripId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<TaskResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.updateTask(tripId, taskId, updates);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ✅ Update task status
 */
export async function updateTaskStatus(
  this: TaskState,
  tripId: string,
  taskId: string,
  status: Task['status'],
): Promise<TaskResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.updateTaskStatus(tripId, taskId, status);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ❌ Delete a task by ID
 */
export async function deleteTask(
  this: TaskState,
  tripId: string,
  taskId: string,
): Promise<TaskResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.deleteTask(tripId, taskId);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ❌ Delete ALL tasks for a trip
 */
export async function deleteAllTasks(this: TaskState, tripId: string): Promise<TaskResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TaskService.deleteAllTasks(tripId);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}
