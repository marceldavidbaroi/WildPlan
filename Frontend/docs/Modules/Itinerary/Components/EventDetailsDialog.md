Here’s a simple **documentation** for your `EventDetailsDialog.vue` in **Markdown** format:

````markdown
# EventDetailsDialog.vue

## 📋 What It Does

A read-only dialog to **view full details of an event** in an itinerary.  
Displays all event fields clearly: name, description, time, location, coordinates, category, assigned users, packing items, estimated cost, notes, status, and timestamps.

---

## ✅ How to Use

```vue
<EventDetailsDialog v-model="showDetailsDialog" :event="selectedEvent" />
```
````

---

## ⚙️ Props

| Prop         | Type    | Description                             |
| ------------ | ------- | --------------------------------------- |
| `modelValue` | Boolean | Controls dialog visibility (`v-model`). |
| `event`      | Object  | Event data object to display.           |

---

## 📢 Emits

| Event               | Description                                  |
| ------------------- | -------------------------------------------- |
| `update:modelValue` | Updates dialog open/close state (`v-model`). |

---

## 📍 Key Features

- Shows event name, description, start & end time.
- Shows location name, address, and coordinates with a map picker.
- Displays category, assigned users (chips), and packing items (chips).
- Shows estimated cost and any notes.
- Displays event completion status.
- Shows created and updated timestamps.
- Uses `MapPicker` in read-only mode to show location.
- Fetches user display names via `authStore` for assigned user IDs.

---

## 🛠️ Utilities Used

- **MapPicker** — for showing event coordinates on a map.
- **useAuthStore** — to resolve assigned user IDs to display names.
- **Quasar** — for layout (`q-dialog`, `q-card`, `q-icon`, `q-badge`, `q-chip`, `q-btn`).

---

## ℹ️ Note

- `formatDate` converts timestamps to readable date/time.
- `formatTime` parses and formats time strings.
- The dialog is **read-only** — no editing here.

---

This component is perfect for giving users a clear, organized view of all details for a planned event.

```

```
