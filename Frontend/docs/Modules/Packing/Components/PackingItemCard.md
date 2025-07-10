# 🎒 `PackingItemCard.vue` Component

A **card grid** to display packing items as **luggage cards**, with due dates, notes, and quick actions.  
Visually groups items by category with color classes.

---

## ✅ **Props**

| Prop      | Type            | Description                                                |
| --------- | --------------- | ---------------------------------------------------------- |
| `items`   | `PackingItem[]` | Array of packing items to display.                         |
| `loading` | `boolean`       | Loading state for action buttons.                          |
| `uid`     | `string`        | Current user’s ID, used for permissions and packing state. |

---

## 📤 **Emits**

| Event           | Payload            | Description                                     |
| --------------- | ------------------ | ----------------------------------------------- |
| `toggle-packed` | `PackingItem`      | Triggered to toggle an item’s packed state.     |
| `add-item`      | `PackingItem`      | Adds a shared item to the user’s personal list. |
| `edit-item`     | `PackingItem`      | Opens edit dialog for the item.                 |
| `delete-item`   | `string` (item ID) | Deletes the item by ID.                         |

---

## ⚙️ **Usage Example**

```vue
<PackingItemCard
  :items="packingItems"
  :loading="loading"
  :uid="currentUserId"
  @toggle-packed="togglePackedState"
  @add-item="addItemToList"
  @edit-item="editPackingItem"
  @delete-item="removePackingItem"
/>
```
