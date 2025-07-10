# Itinerary Service Functions

- `getAllDays(tripId)`  
  Fetch all itinerary days for a trip.

- `getDay(tripId, date)`  
  Fetch a single itinerary day.

- `createDay(tripId, date, newEventData?)`  
  Create a new itinerary day, optionally with one event.

- `addEvent(tripId, date, newEventData)`  
  Add a new event to an itinerary day.

- `updateNotes(tripId, date, notes)`  
  Update daily notes for an itinerary day.

- `editEventById(tripId, date, eventId, updates)`  
  Edit a specific event by its ID.

- `deleteAllEvents(tripId, date)`  
  Delete all events in a day.

- `removeEventById(tripId, date, eventId)`  
  Remove a specific event by ID.

# Itinerary Store Functions

- `normalizeTimestamps(day)`  
  Convert Firestore timestamps to milliseconds.

- `getAllDays(tripId)`  
  Fetch and update store with all itinerary days for a trip.

- `getDay(tripId, date)`  
  Fetch a single itinerary day and update the store.

- `createDay(tripId, date, event?)`  
  Create a new itinerary day (optionally with an event).

- `addEvent(tripId, date, event)`  
  Add a new event to a specific itinerary day.

- `editEventById(tripId, date, eventId, updates)`  
  Edit an event by its ID in a specific day.

- `deleteAllEvents(tripId, date)`  
  Delete all events in a day.

- `removeEventById(tripId, date, eventId)`  
  Remove a single event by ID from a day.

- `updateNotes(tripId, date, notes)`  
  Update daily notes for a specific itinerary day.
