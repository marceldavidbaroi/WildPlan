# Task Priority Board Component

## What it does

- Displays tasks grouped by priority: Low, Medium, High.
- Each priority group shows a list of tasks as cards.
- Tasks show title, due date status, assigned users (avatars), and status color coding.
- Clicking a task opens a dialog to view and update task details (status, priority, assigned users).
- Allows updating task status and priority via dropdowns.
- Supports assigning users to tasks via multi-select.
- Uses reactive properties and Quasar UI components for styling and interactivity.

## Props

- `tasks: Task[]` — array of task objects to display.
- `tripId: string` — identifier used when updating tasks.
- `users: any` — list of users available for task assignment.

## Outcome

- A responsive 3-column task board categorized by priority.
- Interactive task cards with status coloring and due date indicators.
- Task details dialog with editable fields and user assignment.
- Visual cues (colors, avatars, chips) for quick task status understanding.
