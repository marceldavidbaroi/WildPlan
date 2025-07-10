````md
# TripCard.vue Component

## Props

- `trips: Trip[]`  
  An array of trip objects containing details such as `id`, `name`, `photoURL`, `location`, `startDate`, `endDate`, `members`, `status`, and `createdBy`.

## What It Does

- Displays a grid of trip cards; each card shows:
  - Trip cover image (or fallback image if none)
  - Trip name and location
  - Date range formatted as "MMM D - MMM D"
  - Number of members in the trip
  - Status badge with color based on trip status (upcoming, completed, cancelled)
  - Email of the user who created the trip
- Cards have hover effect and are clickable.
- Clicking a card navigates to the trip details page `/trip/{id}`.
- If no trips are available, shows a friendly placeholder with an icon and message.

## Functions

- `formatDate(input)`: Converts date to a short readable format like "Jan 5".
- `getStatusColor(status)`: Returns a color string based on trip status.
- `onCardClick(id)`: Navigates to the trip detail page using Vue Router.
- `getUserDetails(id)`: Finds and returns user info from the global auth store.

## How to Use

```vue
<TripCard :trips="tripList" />
```
````

- Pass an array of trip objects via the `trips` prop.
- The component handles rendering, formatting, and navigation internally.

```

```
