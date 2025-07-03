# Trips Service Functions Overview

- `createTrip(tripData: TripCreateData): Promise<ServiceResponse<Trip>>`  
  Creates a new trip document in Firestore with roles and timestamps.

- `fetchTrip(tripId: string): Promise<ServiceResponse<Trip>>`  
  Retrieves a single trip document by its ID.

- `updateTrip(tripId: string, tripData: Partial<TripCreateData>): Promise<ServiceResponse<void>>`  
  Updates fields of an existing trip document.

- `deleteTrip(tripId: string): Promise<ServiceResponse<void>>`  
  Deletes a trip document by its ID.

- `fetchTrips(options: FetchTripsOptions): Promise<PaginatedTripsResponse>`  
  Fetches multiple trips with filters, pagination, sorting, and search support.

- `handleServiceError<T>(functionName: string, error: unknown): ServiceResponse<T>`  
  Centralized error handler to format and return consistent error responses.

# Trips Store Actions Overview

- `convertTimestampsToNumbers(trip: TripFromFirestore | TripCreateData | Trip): Trip`  
  Converts Firestore `Timestamp` fields (`createdAt`, `updatedAt`) to numeric milliseconds.

- `createTrip(this: TripState, tripData: TripCreateData): Promise<ServiceResponse<Trip>>`  
  Calls service to create a trip, updates local state with the new trip, manages loading and error states.

- `fetchTrip(this: TripState, tripId: string): Promise<ServiceResponse<Trip>>`  
  Fetches a single trip by ID, converts timestamps, sets as active trip, manages loading and error states.

- `fetchTrips(this: TripState, options: FetchTripsOptions): Promise<PaginatedTripsResponse>`  
  Fetches trips with options (pagination, filtering), converts timestamps, appends or replaces trips in state, handles loading and errors.

- `updateTrip(this: TripState, tripId: string, tripData: Partial<Trip>): Promise<ServiceResponse<void>>`  
  Updates a trip via service, merges partial updates into local state for both list and active trip, manages loading and errors.

- `deleteTrip(this: TripState, tripId: string): Promise<ServiceResponse<void>>`  
  Deletes a trip via service, removes it from local state, clears active trip if needed, manages loading and errors.
