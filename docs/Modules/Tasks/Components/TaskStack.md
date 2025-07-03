````markdown
# TaskStack.vue Component

## Purpose

Displays a list of tasks as cards with expandable details.  
Allows editing, assigning users, updating status and priority, and deleting tasks.

## Props

- **tasks** (`Task[]`)  
  Array of task objects to display.

- **users** (`any`)  
  List of users available for assignment.

- **tripId** (`string`)  
  Trip identifier related to tasks.

- **status** (`TaskStatus | any`)  
  Current status group label shown in footer card.

## Emits

- **update**  
  Emitted when tasks are updated or deleted to notify parent.

## Features

- Renders each task in a card with clickable expand/collapse.
- When expanded, shows:
  - Assign user UI with `q-select` (multiple users).
  - Buttons to edit (opens `AddDialog`), delete (with confirmation), and close card.
  - Dropdowns to update task status and priority with loading indication.
  - Task description and last updated timestamp.
- Visual badges for priority and due date status.
- Uses Quasar UI components for styling and interaction.
- Calls store actions (`updateTask`, `deleteTask`) and shows notifications on success/failure.

## Example Usage

```vue
<TaskStack :tasks="tasks" :users="users" :tripId="tripId" status="pending" @update="fetchTasks" />
```
````

---

### Notes on Implementation

- **State management:**

  - `expandedCard` tracks which card is expanded.
  - `showAssignUser` controls assign user UI visibility.
  - `showDialog` controls the edit dialog visibility.

- **Methods:**

  - `toggleExpand(index)` toggles card expansion.
  - `updateStatus` and `updatePriority` update task fields and persist changes.
  - `onMemberAdd` handles user assignment changes.
  - `onDelete` deletes a task with confirmation and emits update.
  - `handleUpdate` handles task edits from `AddDialog`.
  - `calculateDueDateStatus` returns human-readable due date status with styles.

- **Styling:**

  - Different background and text colors by task status and priority, adapted for light/dark modes.
  - Smooth card hover and expand animations for user experience.

---

### Dependencies

- Quasar Framework components (`q-card`, `q-btn`, `q-select`, `q-avatar`, `q-tooltip`, `q-badge`, `q-btn-dropdown`)
- Vue 3 Composition API (`ref`, `defineProps`, `defineEmits`)
- Vuex or Pinia store for task management (`useTaskStore`)
- Notification plugin (`Notify`)
- Auth store for current user info (`useAuthStore`)
- Custom dialog component for editing tasks (`AddDialog`)

---

### Props Type Definitions (TypeScript)

```ts
import type { Task, TaskStatus, TaskPriority } from '../store/types';

const props = defineProps<{
  tasks: Task[];
  users: any;
  tripId: string;
  status: TaskStatus | any;
}>();
```

---

### Events

- Emits `update` when tasks have been updated or deleted so that parent can refresh.

---

```

```
