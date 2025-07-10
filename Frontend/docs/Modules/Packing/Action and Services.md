# 📦 Packing Service API

**File:** `src/services/packing-service.ts`  
Central service for managing **trip packing items** in Firestore.

---

## ✅ Functions

### `getPackingItems(options: PackingFetchOptions)`

Fetch **all packing items** for a trip, with optional filters:

- `type`
- `ownerId`
- `category`
- `packedStatus`

---

### `addPackingItem(tripId: string, data: PackingItemCreate)`

Add a **new packing item** to a specific trip.

---

### `updatePackingItem(tripId: string, itemId: string, updates: Partial<PackingItem>)`

Update an existing **packing item** by its ID.

---

### `togglePackedStatus(tripId: string, itemId: string, isPacked: boolean)`

Convenience helper to **mark an item packed or unpacked**.

---

### `deletePackingItem(tripId: string, itemId: string)`

Delete a **single packing item** by its ID.

---

### `getPackingItemById(tripId: string, itemId: string)`

Fetch a **single packing item** by its ID.

---

### `deleteAllPackingItems(tripId: string)`

Delete **all packing items** for a given trip.

---

## ⚙️ Utilities

### `handlePackingError(fn: string, error: unknown)`

Centralized **error handler** to format all responses consistently.

### `getPackingCollection(tripId: string)`

Returns the **Firestore collection reference** for packing items under the given trip.

---

## 🔗 Related Types

- `PackingItemCreate`
- `PackingItem`
- `PackingResponse<T>`
- `PackingFetchOptions`

---

**Purpose:**  
This service keeps all CRUD operations for trip packing lists in one place and provides consistent responses + error handling.

# 🧳 Packing Store Actions

**File:** _(Your Vue Store Actions for Packing Items)_

---

## ✅ Purpose

This module wraps the **Packing Service** functions with local state management:

- Tracks `loading` and `error` state.
- Normalizes Firestore timestamps.
- Filters items based on owner or type.

---

## 📌 Functions

### `normalizePackingItem(item: PackingItemRaw)`

Utility:  
Normalizes Firestore `Timestamp` fields (`createdAt` & `updatedAt`) to milliseconds.

---

### `getPackingItems(options: PackingFetchOptions)`

- Calls `PackingService.getPackingItems`.
- Normalizes all timestamps.
- Filters data:
  - `type === 'shared'` is kept.
  - `type === 'personal'` is only kept if `ownerId` matches logged-in user.
- Updates `this.items`.
- Manages `loading` and `error`.

---

### `addPackingItem(tripId: string, data: PackingItemCreate)`

- Calls `PackingService.addPackingItem` to add a new packing item.
- Manages `loading` and `error`.

---

### `updatePackingItem(tripId: string, itemId: string, updates: Partial<PackingItem>)`

- Calls `PackingService.updatePackingItem` to update an item by ID.
- Manages `loading` and `error`.

---

### `togglePackedStatus(tripId: string, itemId: string, isPacked: boolean)`

- Calls `PackingService.togglePackedStatus` to mark an item packed/unpacked.
- Uses `updatePackingItem` under the hood.
- Manages `loading` and `error`.

---

### `deletePackingItem(tripId: string, itemId: string)`

- Calls `PackingService.deletePackingItem` to remove a single packing item.
- Manages `loading` and `error`.

---

### `deleteAllPackingItems(tripId: string)`

- Calls `PackingService.deleteAllPackingItems` to clear all packing items for the trip.
- Manages `loading` and `error`.

---

## ⚙️ State Dependencies

- Uses `PackingState`:

  - `items: PackingItem[]`
  - `loading: boolean`
  - `error: string | null`

- Uses `authStore`:
  - Filters personal items based on `authStore.profile!.uid`.

---

## 🔗 Related

- Relies on: `PackingService`
- Types:
  - `PackingItem`, `PackingItemCreate`, `PackingState`, `PackingResponse<T>`

---

**Tip:**  
These actions are designed for **Pinia** or Vue’s Composition API.  
They must be called with `this` bound to the packing state.

---

**Usage Example:**

```ts
await getPackingItems.call(packingState, { tripId: 'abc123' });
```
