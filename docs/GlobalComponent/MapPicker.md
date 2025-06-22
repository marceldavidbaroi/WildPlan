This is a simple document for the provided Vue.js component, explaining what it is and how to use it.

````markdown
# Location Picker Component

A Vue.js component that allows users to pick a location on an interactive map, powered by Leaflet and Leaflet-GeoSearch.

## What it is

This component provides a user-friendly way to select geographical coordinates (latitude and longitude) using a map interface. It features:

- **Interactive Map:** Displays an OpenStreetMap tile layer where users can click or drag a marker to select a location.
- **Location Search:** Integrates with Leaflet-GeoSearch to allow users to search for locations by name, which then updates the map marker.
- **Coordinate Display:** Shows the currently selected latitude and longitude.
- **Two-way Binding (Optional):** Supports `v-model` for easy integration into forms.
- **Emits Events:** Notifies the parent component when a location is picked.

## How to Use

### 1. Installation (if not already done)

Ensure you have Leaflet and Leaflet-GeoSearch installed in your project:

```bash
npm install leaflet leaflet-geosearch
# OR
yarn add leaflet leaflet-geosearch
```
````

### 2\. Import the Component

You can directly use the provided `.vue` file in your Vue project.

### 3\. Basic Usage

```vue
<template>
  <div>
    <LocationPicker @picked="handleLocationPicked" />
  </div>
</template>

<script setup>
import LocationPicker from './LocationPicker.vue'; // Adjust the path as needed

const handleLocationPicked = (location) => {
  console.log('Picked Location:', location);
  // Do something with the picked location, e.g., store it in your data
};
</script>
```

### 4\. Using with `v-model` (Two-way Binding)

You can use `v-model` to bind the selected location to a data property in your parent component.

```vue
<template>
  <div>
    <LocationPicker v-model="myLocation" />
    <p>My Stored Location: Lat: {{ myLocation?.lat }}, Lng: {{ myLocation?.lng }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LocationPicker from './LocationPicker.vue'; // Adjust the path as needed

const myLocation = ref(null); // Or an initial object like { lat: 23.8103, lng: 90.4125 }
</script>
```

### 5\. Props

| Prop Name         | Type   | Default Value                    | Description                                                                               |
| :---------------- | :----- | :------------------------------- | :---------------------------------------------------------------------------------------- |
| `modelValue`      | Object | `null`                           | Used for two-way binding with `v-model`. Expected format: `{ lat: Number, lng: Number }`. |
| `initialLocation` | Object | `{ lat: 23.8103, lng: 90.4125 }` | The initial center and marker position of the map. Defaults to Dhaka, Bangladesh.         |

### 6\. Events

| Event Name          | Payload                        | Description                                                                  |
| :------------------ | :----------------------------- | :--------------------------------------------------------------------------- |
| `update:modelValue` | `{ lat: Number, lng: Number }` | Emitted when the `pickedLocation` changes, primarily for `v-model` support.  |
| `picked`            | `{ lat: Number, lng: Number }` | Emitted when the "Set Location" button is clicked, confirming the selection. |

### 7\. Styling

The component includes some basic styling for Leaflet and Leaflet-GeoSearch to ensure proper display and z-indexing within a Quasar dialog.

- `leaflet-control-geosearch`: Ensures the search bar is above other elements.
- `leaflet-control-geosearch .results`: Styles the search results dropdown.

You can override these styles in your parent component's style block if needed.

```

```
