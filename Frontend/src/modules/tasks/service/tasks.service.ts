// src/services/task-service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  FirestoreError,
  writeBatch,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type { TaskCreate, Task, TaskDoc, TaskResponse, TaskFetchOptions } from '../store/types';

// 🔗 Collection ref: tasks under a trip
const getTaskCollection = (tripId: string) => collection(db, 'trips', tripId, 'tasks');

// ✅ Centralized error handler
function handleTaskError<T>(fn: string, error: unknown): TaskResponse<T> {
  console.error(`[TaskService.${fn}] Error:`, error);

  let message = `Failed to ${fn}.`;
  let errorCode: string | undefined;
  let errorDetails: string | undefined;

  if (error instanceof FirestoreError) {
    message = error.message;
    errorCode = error.code;
    errorDetails = error.message;
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = error.message;
  } else {
    errorDetails = String(error);
  }

  const response: TaskResponse<T> = {
    success: false,
    message,
  };

  if (errorCode) response.errorCode = errorCode;
  if (errorDetails) response.errorDetails = errorDetails;

  return response;
}

// 📦 Get all tasks (with simple filters)
export async function getTasks(options: TaskFetchOptions): Promise<TaskResponse<Task[]>> {
  try {
    let q = query(getTaskCollection(options.tripId));

    if (options.assignedTo) {
      q = query(q, where('assignedTo', 'array-contains', options.assignedTo));
    }
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options.priority) {
      q = query(q, where('priority', '==', options.priority));
    }

    const snapshot = await getDocs(q);
    const tasks: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as TaskDoc;
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      };
    });

    return { success: true, message: 'Tasks fetched.', data: tasks };
  } catch (error) {
    return handleTaskError<Task[]>('getTasks', error);
  }
}

// ➕ Add new task
export async function addTask(tripId: string, data: TaskCreate): Promise<TaskResponse<void>> {
  try {
    const now = serverTimestamp();
    const newTask: Omit<TaskDoc, 'createdAt' | 'updatedAt'> & {
      createdAt: unknown;
      updatedAt: unknown;
      status: 'pending';
    } = {
      ...data,
      assignedTo: data.assignedTo ?? [],
      priority: data.priority ?? 'medium',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(getTaskCollection(tripId), newTask);

    return { success: true, message: 'Task added.' };
  } catch (error) {
    return handleTaskError<void>('addTask', error);
  }
}

// ✏️ Update task by ID
export async function updateTask(
  tripId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<TaskResponse<void>> {
  try {
    const ref = doc(getTaskCollection(tripId), taskId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Task updated.' };
  } catch (error) {
    return handleTaskError<void>('updateTask', error);
  }
}

// ✅ Update task status (convenience)
export async function updateTaskStatus(
  tripId: string,
  taskId: string,
  status: TaskDoc['status'],
): Promise<TaskResponse<void>> {
  return updateTask(tripId, taskId, { status });
}

// ❌ Delete task by ID
export async function deleteTask(tripId: string, taskId: string): Promise<TaskResponse<void>> {
  try {
    const ref = doc(getTaskCollection(tripId), taskId);
    await deleteDoc(ref);

    return { success: true, message: 'Task deleted.' };
  } catch (error) {
    return handleTaskError<void>('deleteTask', error);
  }
}

// 📥 Get single task by ID
export async function getTaskById(tripId: string, taskId: string): Promise<TaskResponse<Task>> {
  try {
    const ref = doc(getTaskCollection(tripId), taskId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return {
        success: false,
        message: 'Task not found.',
        errorCode: 'NOT_FOUND',
      };
    }

    const data = snap.data() as TaskDoc;

    return {
      success: true,
      message: 'Task fetched.',
      data: {
        id: snap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      },
    };
  } catch (error) {
    return handleTaskError<Task>('getTaskById', error);
  }
}

// ❌ Delete ALL tasks for a trip
export async function deleteAllTasks(tripId: string): Promise<TaskResponse<void>> {
  try {
    const colRef = getTaskCollection(tripId);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return { success: true, message: 'No tasks to delete.' };
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();

    return { success: true, message: 'All tasks deleted.' };
  } catch (error) {
    return handleTaskError<void>('deleteAllTasks', error);
  }
}
