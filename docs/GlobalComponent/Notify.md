````markdown
# NotifyMessage.vue

A simple Vue 3 component using Quasar's `Notify` composable to show toast notifications  
based on reactive props for success state and message content.

---

## What is it?

`NotifyMessage.vue` is a lightweight component that watches for changes in two props:

- `success` (`boolean`): indicates if the notification is for a successful or failed action
- `message` (`string`): the text to display in the notification

When the `message` changes, the component automatically triggers a Quasar Notify popup at the top center of the screen,  
styled green for success or red for failure.

---

## Features

- Displays notification on prop changes immediately
- Uses Quasar Notify's `create` method for rich toast notifications
- Shows an icon (`check_circle` for success, `error` for failure)
- Includes a close button
- Auto-dismisses after 5 seconds
- Text color set to white for better contrast

---

## Usage

1. **Import the component**

```vue
<script setup lang="ts">
import NotifyMessage from '@/components/NotifyMessage.vue'; // adjust path as needed

const success = ref(false);
const message = ref('');
</script>
```
````

2. **Add the component to your template**

```vue
<template>
  <NotifyMessage :success="success" :message="message" />
</template>
```

3. **Update props to show notification**

Change the `success` and `message` reactive variables to trigger notifications:

```ts
success.value = true;
message.value = 'Operation completed successfully!';
```

Or on error:

```ts
success.value = false;
message.value = 'Something went wrong.';
```

---

## Props

| Name    | Type    | Description                                                 |
| ------- | ------- | ----------------------------------------------------------- |
| success | boolean | Whether the notification is success (true) or error (false) |
| message | string  | The notification text to display                            |

---

## Requirements

- Vue 3 with `<script setup>`
- Quasar Framework v2+ with `Notify` plugin enabled in `quasar.conf.js`:

```js
framework: {
  plugins: ['Notify'];
}
```

---

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import NotifyMessage from '@/components/NotifyMessage.vue';

const success = ref(false);
const message = ref('');

function simulateLogin() {
  // Simulate success
  success.value = true;
  message.value = 'Login successful!';
}

function simulateError() {
  success.value = false;
  message.value = 'Login failed.';
}
</script>

<template>
  <NotifyMessage :success="success" :message="message" />
  <button @click="simulateLogin">Simulate Success</button>
  <button @click="simulateError">Simulate Error</button>
</template>
```

---

## Notes

- The component uses a `watch` with `immediate: true`, so it will show notification on initial mount if `message` is non-empty.
- You can customize notification options inside the component as needed (e.g., timeout, position, icons).

```

```
