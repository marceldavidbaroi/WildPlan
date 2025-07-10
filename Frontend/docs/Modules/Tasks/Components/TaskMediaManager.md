# TaskList.vue Component

## Purpose

Display tasks filtered by user selection: "My Tasks", "Created By Me", or "All Tasks".  
Shows tasks grouped by status using `TaskStack` or a table view for all tasks.

## Props

- **tasks** (`Task[]`)  
  List of all tasks.

- **users** (`object`)  
  User info for task assignments.

- **tripId** (`string`)  
  Trip identifier.

- **uid** (`string`)  
  Current user ID.

## Events (Emits)

- **update**  
  Emitted when tasks are updated (propagated from child components).

## Features

- Button group to switch task views:

  - **My Tasks**: tasks assigned to current user.
  - **Created By Me**: tasks created by current user (owner).
  - **All Tasks**: show all tasks in a table view.

- Tasks grouped and filtered by status: pending, inProgress, completed, cancelled, unassigned.

- Uses child components:
  - `TaskStack` to show tasks by status in stack form.
  - `TaskTableView` to show all tasks in a table.

## Usage Example

```vue
<TaskList
  :tasks="tasks"
  :users="users"
  :tripId="tripId"
  :uid="currentUserId"
  @update="fetchTasks"
/>
```
