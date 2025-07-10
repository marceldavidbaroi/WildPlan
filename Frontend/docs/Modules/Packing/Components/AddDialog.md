# ➕ `AddDialog.vue` Component

A **modal dialog** for adding or editing a packing item in a trip.  
Uses **Quasar’s `<q-dialog>`**, form inputs, and emits events for parent control.

---

## ✅ **Props**

| Prop         | Type                  | Description                                    |
| ------------ | --------------------- | ---------------------------------------------- |
| `visible`    | `boolean`             | Controls dialog visibility (v-model external). |
| `tripId`     | `string`              | The ID of the trip for new items.              |
| `ownerId`    | `string`              | The current user’s ID.                         |
| `loading`    | `boolean`             | Shows a loading state on the submit button.    |
| `isEdit`     | `boolean`             | If `true`, dialog works in edit mode.          |
| `itemToEdit` | `PackingItem \| null` | Existing item to prefill fields when editing.  |

---

## 📤 **Emits**

| Event    | Payload             | When                                         |
| -------- | ------------------- | -------------------------------------------- |
| `submit` | `PackingItemCreate` | Fires when adding a new item.                |
| `update` | `PackingItem`       | Fires when updating an existing item.        |
| `close`  | `void`              | Fires when dialog closes (cancel or submit). |

---

## ⚙️ **Usage Example**

```vue
<AddDialog
  :visible="showDialog"
  :trip-id="tripId"
  :owner-id="userId"
  :loading="loading"
  :is-edit="isEditMode"
  :item-to-edit="selectedItem"
  @submit="handleAdd"
  @update="handleUpdate"
  @close="showDialog = false"
/>
```
