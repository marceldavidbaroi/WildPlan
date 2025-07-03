````markdown
# AddTask.vue Component

## Purpose

Dialog form to create a new task or edit an existing one.

## Props

- **modelValue** (`boolean`)  
  Controls dialog visibility (`v-model`).

- **isEdit** (`boolean`, optional)  
  If true, the form is in edit mode.

- **task** (`Task`, optional)  
  Task object to edit (used only if `isEdit` is true).

## Events (Emits)

- **update:modelValue** (`boolean`)  
  Emitted when dialog opens/closes to sync visibility.

- **save** (`Task`)  
  Emitted when user clicks "Save" with the form data.

## Usage Example

```vue
<AddTask v-model="showDialog" :isEdit="true" :task="taskToEdit" @save="handleSave" />
```
````

- `showDialog` controls dialog open/close
- `taskToEdit` is the task being edited
- `handleSave` handles saving the task data emitted from the component

```

```
