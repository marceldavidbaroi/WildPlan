Here's a complete `LocationPicker.md` documentation file for your Vue 3 + Quasar + Leaflet location picker component:

---

### 📄 `LocationPicker.md`

````md
# 📍 LocationPicker Component

A reusable Vue 3 + Quasar + Leaflet-based location picker component that allows users to select a location on an interactive map.

---

## 🚀 Features

- Interactive Leaflet map inside a Quasar Dialog
- Draggable marker to choose precise location
- Click map to set marker
- Optional OpenStreetMap search input (GeoSearch)
- Two-way binding support (`v-model`)
- Automatically handles different coordinate formats (`lat/lng` or `latitude/longitude`)
- Emits selected location to parent

---

## 🔧 Props

| Prop              | Type      | Default                          | Description                                                                               |
| ----------------- | --------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `modelValue`      | `Object`  | –                                | Two-way bound location object (`{ lat, lng }`)                                            |
| `initialLocation` | `Object`  | `{ lat: 23.8103, lng: 90.4125 }` | Initial location for map centering. Supports `{ lat, lng }` or `{ latitude, longitude }`. |
| `isSetLocation`   | `Boolean` | `true`                           | Show/hide "Set Location" button                                                           |
| `btnLabel`        | `String`  | `"Pick Location"`                | Label for the trigger button                                                              |

---

## 📤 Emits

| Event               | Payload                        | Description                            |
| ------------------- | ------------------------------ | -------------------------------------- |
| `update:modelValue` | `{ lat: number, lng: number }` | Emitted when marker is moved/clicked   |
| `picked`            | `{ lat: number, lng: number }` | Emitted when "Set Location" is clicked |

---

## 📦 Usage

### 1. Register the component

```ts
// In your component
import LocationPicker from '@/components/LocationPicker.vue';
```
````

### 2. Use in a template

```vue
<template>
  <LocationPicker
    v-model="location"
    :initialLocation="{ latitude: 40.7128, longitude: -74.006 }"
    :isSetLocation="true"
    btn-label="Choose on Map"
    @picked="onLocationPicked"
  />
</template>

<script setup>
import { ref } from 'vue';

const location = ref({ lat: 23.8103, lng: 90.4125 });

function onLocationPicked(coords) {
  console.log('Selected:', coords);
}
</script>
```

---

## 🧠 Coordinate Normalization

The component automatically normalizes the `initialLocation` prop to support:

- `{ lat, lng }`
- `{ latitude, longitude }`

If both are missing or invalid, it defaults to Dhaka (🇧🇩) coordinates.

---

## 🗺️ Notes

- Uses Leaflet with OpenStreetMap tiles
- Includes `leaflet-geosearch` for search functionality
- Responsive and mobile-friendly
- Works well in admin dashboards or event planners

---

## 🧩 Dependencies

Make sure to install:

```bash
npm install leaflet leaflet-geosearch
```

Also include Leaflet CSS globally or via component scope.

---
