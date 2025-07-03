# 🧳 Packing Module Overview

This module handles the **trip packing feature** — manage, view, and organize items to pack for a trip.

---

## 📂 Structure

### **`packing/`**

Root folder for all packing-related logic, UI, and pages.

---

## 📁 `components/`

Reusable UI components for packing items.

- **`AddDialog.vue`**  
  ➕ Modal dialog for adding a new packing item.

- **`PackingItemCard.vue`**  
  🗂️ Card component to display a single packing item’s details, status, and actions.

---

## 📁 `pages/`

Page-level components for packing views.

- **`PackingIndex.vue`**  
  📄 Entry point or list view for all packing items — shows all packing lists for trips.

- **`TripPacking.vue`**  
  🧳 Detailed view for managing packing items for a specific trip.

---

**Purpose:**  
Combine reusable components, dialogs, and pages to build a complete packing workflow in your trip-planning app.
