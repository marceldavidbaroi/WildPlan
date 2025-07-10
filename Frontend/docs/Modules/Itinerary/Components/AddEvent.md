Here’s a simple **documentation** for your `AddEventDialog.vue` in **Markdown** format:

````markdown
# AddEventDialog.vue

## 📋 What It Does

A reusable modal dialog for creating or editing an itinerary event.  
Includes form inputs for event details, time pickers, map location picker, category, assigned users, packing items, estimated cost, and notes.

---

## ✅ How to Use

```vue
<AddEventDialog
  v-model:show="showDialog"
  :form="eventForm"
  :initial-location="initialLocation"
  :category-options="categories"
  :user-options="users"
  :packing-items="packingItems"
  :trip-id="tripId"
  @submit="handleSubmit"
  @location-picked="handleLocationPicked"
/>
```
````

---

## ⚙️ Props

| Prop                 | Type    | Description                                                        |
| -------------------- | ------- | ------------------------------------------------------------------ |
| `show`               | Boolean | Controls dialog visibility (`v-model:show`).                       |
| `form`               | Object  | The event form data object (for create/edit).                      |
| `initialLocation`    | Object  | Initial coordinates for the map picker.                            |
| `categoryOptions`    | Array   | Options for event category select.                                 |
| `userOptions`        | Array   | User options for assigning event tasks.                            |
| `packingItems`       | Array   | List of available packing items to select for the event.           |
| `packingItemOptions` | Array   | (Unused here) — can be ignored or used for custom packing options. |
| `isEdit`             | Boolean | If `true`, keeps form values on open (for editing).                |
| `tripId`             | String  | Used for routing to the packing items page for the current trip.   |

---

## 📢 Emits

| Event             | Description                                     |
| ----------------- | ----------------------------------------------- |
| `update:show`     | Updates the dialog open/close state.            |
| `submit`          | Emits the filled event form on submit.          |
| `location-picked` | Emits when a new location is picked on the map. |

---

## 📍 Key Features

- Validates required fields.
- Uses time pickers (`TimePicker15Min`).
- Uses map picker (`MapPicker`) for selecting coordinates.
- Allows assigning users and packing items.
- Supports quick link to packing items page.
- Works for both creating and editing an event.

---

```

```
