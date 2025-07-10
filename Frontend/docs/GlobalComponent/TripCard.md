````markdown
# TripCardGrid Component Documentation

The `TripCardGrid` component is a Vue.js component designed to display a collection of trip cards in a responsive grid layout. Each card provides a quick overview of a trip, including its name, location, dates, number of members, status, and creator.

---

## How to Use

To use the `TripCardGrid` component, simply import it into your Vue component and pass an array of `Trip` objects as a prop.

### 1. Import the Component

```typescript
// In your parent component's script section
import TripCardGrid from 'path/to/TripCardGrid.vue';
```
````

### 2\. Define Trip Data

Ensure you have an array of trip objects that conform to the `Trip` interface. Here's an example of what a `Trip` object might look like (based on the provided code):

```typescript
interface Trip {
  id: string;
  name: string;
  location: {
    name: string;
    // ... other location properties if any
  };
  startDate: string | number; // Date string or timestamp
  endDate: string | number; // Date string or timestamp
  members: any[]; // Array of members, length is used
  status: 'upcoming' | 'completed' | 'cancelled';
  createdBy: string;
  photoURL?: string; // Optional photo URL for the trip card
}
```

### 3\. Use in Your Template

Pass your `trips` array to the `TripCardGrid` component using the `v-bind` directive (`:` shorthand):

```vue
<template>
  <div class="my-page">
    <TripCardGrid :trips="myTripsArray" @card-click="handleCardClick" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TripCardGrid from './TripCardGrid.vue'; // Adjust the path as needed

// Example trip data
const myTripsArray = ref([
  {
    id: '1',
    name: 'European Adventure',
    location: { name: 'Paris, France' },
    startDate: '2025-07-10',
    endDate: '2025-07-25',
    members: [{}, {}, {}], // Example: 3 members
    status: 'upcoming',
    createdBy: 'Alice Wonderland',
    photoURL: '[https://example.com/paris.jpg](https://example.com/paris.jpg)',
  },
  {
    id: '2',
    name: 'Mountain Retreat',
    location: { name: 'Dolomites, Italy' },
    startDate: '2024-09-01',
    endDate: '2024-09-07',
    members: [{}, {}], // Example: 2 members
    status: 'completed',
    createdBy: 'Bob The Builder',
    photoURL: '[https://example.com/dolomites.jpg](https://example.com/dolomites.jpg)',
  },
  {
    id: '3',
    name: 'Beach Getaway',
    location: { name: 'Bali, Indonesia' },
    startDate: '2025-03-15',
    endDate: '2025-03-22',
    members: [{}], // Example: 1 member
    status: 'cancelled',
    createdBy: 'Charlie Chaplin',
    photoURL: '[https://example.com/bali.jpg](https://example.com/bali.jpg)',
  },
]);

// Handle card click event
const handleCardClick = (tripId: string) => {
  console.log('Card clicked for trip ID:', tripId);
  // You might want to navigate to a trip detail page here
  // For example, using Vue Router:
  // router.push(`/trips/${tripId}`);
};
</script>
```

---

## Props

The `TripCardGrid` component accepts the following prop:

| Prop Name   | Type     | Required | Description                                        |
| :---------- | :------- | :------- | :------------------------------------------------- |
| **`trips`** | `Trip[]` | Yes      | An array of trip objects to be displayed as cards. |

---

## Events

The `TripCardGrid` component emits the following event:

| Event Name       | Arguments    | Description                                                                                   |
| :--------------- | :----------- | :-------------------------------------------------------------------------------------------- |
| **`card-click`** | `id: string` | Emitted when a trip card is clicked. The `id` of the clicked trip is provided as an argument. |

---

## Component Structure and Features

- **Responsive Grid:** Trips are displayed in a responsive grid, adapting to different screen sizes (`col-12` for extra small, `col-sm-6` for small, `col-md-3` for medium and larger).
- **Trip Cards (`q-card`):** Each trip is rendered as a `q-card` from Quasar Framework, providing a consistent and material design look.
- **Interactive Cards:** Cards are **clickable**, emitting a `card-click` event with the `id` of the trip.
- **Image Display:** Each card shows a cover image for the trip. If `trip.photoURL` is not provided, a fallback image from Quasar is used.
- **Information Overlay:** Key trip details are overlaid on the image, making them easily visible.
  - **Trip Name (`title`):** Bolded for prominence.
  - **Location:** Displays the `location.name` in a smaller, greyed text.
  - **Chips (`q-chip`):**
    - **Dates:** Formatted as "MMM D - MMM D" (e.g., "Jul 10 - Jul 25").
    - **Members:** Shows the number of members in the trip.
    - **Status:** Displays the trip status (`upcoming`, `completed`, `cancelled`) with a corresponding color (primary, positive, negative).
  - **Creator:** Shows "by \[creator's name]".
- **No Trips State:** If the `trips` array is empty, a message indicating "No Trips Yet" with a relevant icon (`map_off`) is displayed, encouraging the user to start planning.
- **Hover Effect:** Cards have a subtle lift and shadow effect on hover, indicating interactivity.

<!-- end list -->

```

```
