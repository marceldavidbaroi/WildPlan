-----

# Confirmation Dialog Component

This document explains how to use the `ConfirmationDialog` Vue component, which provides a customizable dialog for confirming deletion actions.

---

--

## What it is

The `ConfirmationDialog` is a reusable Vue component designed to display a confirmation dialog, typically used for irreversible actions like deleting data. It features:

- A **warning icon** and a **"Confirm Deletion"** title.
- An **optional message** to provide context for the user.
- An **optional verification step** where the user must type a specific text to enable the "Delete" button, adding an extra layer of caution.
- **Loading state** for the delete button to indicate ongoing processes.
- **Cancel** and **Confirm** buttons.

---

## How to use it

Here's how you can integrate and use the `ConfirmationDialog` component in your Vue application:

### 1\. Import the component

First, make sure you have the component file (`ConfirmationDialog.vue` from the provided code) in your project. Then, you can import it into your parent component:

```vue
<script setup lang="ts">
import ConfirmationDialog from './ConfirmationDialog.vue';
// Adjust the path according to your project structure
</script>
```

### 2\. Basic Usage

The simplest way to use the dialog is by controlling its visibility with `v-model`.

```vue
<template>
  <q-btn label="Delete Item" color="negative" @click="showDeleteDialog = true" />

  <ConfirmationDialog v-model="showDeleteDialog" @confirm="handleConfirm" @cancel="handleCancel" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfirmationDialog from './ConfirmationDialog.vue';

const showDeleteDialog = ref(false);

const handleConfirm = () => {
  console.log('Deletion confirmed!');
  // Perform your delete logic here
  showDeleteDialog.value = false; // Close the dialog after confirmation
};

const handleCancel = () => {
  console.log('Deletion cancelled.');
  showDeleteDialog.value = false; // Close the dialog
};
</script>
```

### 3\. Props

You can customize the dialog's behavior and content using the following props:

| Prop Name    | Type      | Default     | Description                                                                   |
| :----------- | :-------- | :---------- | :---------------------------------------------------------------------------- |
| `modelValue` | `boolean` | `false`     | Controls the visibility of the dialog. Use with `v-model`.                    |
| `message`    | `string`  | `undefined` | An optional message displayed in the dialog body.                             |
| `verifyText` | `string`  | `undefined` | If provided, the user must type this text to enable the "Delete" button.      |
| `loading`    | `boolean` | `false`     | When `true`, the "Delete" button will show a loading spinner and be disabled. |

#### Example with `message` and `verifyText`

```vue
<template>
  <q-btn label="Delete User" color="negative" @click="showDeleteUserDialog = true" />

  <ConfirmationDialog
    v-model="showDeleteUserDialog"
    message="Are you sure you want to permanently delete this user? This action cannot be undone."
    verifyText="DELETE_USER"
    :loading="isDeletingUser"
    @confirm="deleteUser"
    @cancel="cancelDeleteUser"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConfirmationDialog from './ConfirmationDialog.vue';

const showDeleteUserDialog = ref(false);
const isDeletingUser = ref(false);

const deleteUser = async () => {
  isDeletingUser.value = true;
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('User deleted!');
  isDeletingUser.value = false;
  showDeleteUserDialog.value = false;
};

const cancelDeleteUser = () => {
  console.log('User deletion cancelled.');
  showDeleteUserDialog.value = false;
};
</script>
```

### 4\. Events

The component emits the following events:

| Event Name          | Description                                                                                 | Payload   |
| :------------------ | :------------------------------------------------------------------------------------------ | :-------- |
| `update:modelValue` | Emitted when the dialog's visibility changes. Used with `v-model`.                          | `boolean` |
| `confirm`           | Emitted when the user clicks the "Delete" button (and `verifyText` matches, if applicable). | `none`    |
| `cancel`            | Emitted when the user clicks the "Cancel" button or clicks outside the dialog.              | `none`    |

---
