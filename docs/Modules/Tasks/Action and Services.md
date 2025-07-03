# ✅ `task-service.ts` — Task Firestore Service

Centralized Firestore CRUD service for **trip tasks**.

---

## 🔗 Collection

**`/trips/{tripId}/tasks`**  
All task docs are stored under their parent trip.

---

## 📦 **Functions**

### `getTasks(options: TaskFetchOptions)`

**Fetch** all tasks for a trip with optional filters:

- `assignedTo` → Filter tasks assigned to a user.
- `status` → Filter by task status.
- `priority` → Filter by priority.

---

### `addTask(tripId: string, data: TaskCreate)`

**Add** a new task to a trip.  
Automatically sets:

- `status` → `'pending'`
- `priority` → defaults to `'medium'`
- `createdAt` and `updatedAt` → Firestore server timestamp.

---

### `updateTask(tripId: string, taskId: string, updates: Partial<Task>)`

**Update** an existing task by ID.  
Merges provided fields, updates `updatedAt`.

---

### `updateTaskStatus(tripId: string, taskId: string, status: TaskDoc['status'])`

**Convenience helper** to update only a task’s `status`.

---

### `deleteTask(tripId: string, taskId: string)`

**Delete** a single task by ID.

---

### `getTaskById(tripId: string, taskId: string)`

**Get** a single task by ID.

---

### `deleteAllTasks(tripId: string)`

**Bulk delete** all tasks under a trip.  
Uses **Firestore batch write**.

---

## ⚠️ **Error Handling**

All methods return:

```ts
{
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errorDetails?: string;
}


# ✅ `task-actions.ts` — Task State Actions

Wrapper layer for `TaskService` methods with state management and normalization.

---

## 🔄 Helper

### `normalizeTask(item: TaskRaw): Task`
Converts Firestore `Timestamp` fields (`createdAt`, `updatedAt`) to milliseconds.

---

## 📋 **Actions**

All actions expect `this` to be a **`TaskState`** instance and manage:
- `loading` flag
- `error` message
- update internal `tasks` state where applicable

---

### `getTasks(options: TaskFetchOptions): Promise<TaskResponse<Task[]>>`
Fetch tasks with filters and normalize timestamps. Updates internal `tasks` state.

---

### `addTask(tripId: string, data: TaskCreate): Promise<TaskResponse<void>>`
Add a new task. Sets loading/error state accordingly.

---

### `updateTask(tripId: string, taskId: string, updates: Partial<Task>): Promise<TaskResponse<void>>`
Update task fields by ID.

---

### `updateTaskStatus(tripId: string, taskId: string, status: Task['status']): Promise<TaskResponse<void>>`
Update only task status.

---

### `deleteTask(tripId: string, taskId: string): Promise<TaskResponse<void>>`
Delete task by ID.

---

### `deleteAllTasks(tripId: string): Promise<TaskResponse<void>>`
Delete all tasks for a trip.

---

## ⚠️ Error Handling & State Management

- Sets `loading` true while processing, false on completion.
- Resets or sets `error` message based on operation success.
- Updates internal `tasks` array after fetch.

---

**Purpose:**
Facilitates stateful interaction with task Firestore services in UI/store context.
```
