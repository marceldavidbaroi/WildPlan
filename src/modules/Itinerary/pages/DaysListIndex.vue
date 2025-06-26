<template>
  <q-page padding>
    <div v-if="itineraryStore.isLoading" class="flex flex-center q-py-xl">
      <q-spinner-ball color="primary" size="xl" />
      <div class="text-h6 q-ml-md text-grey-7">Loading your itinerary...</div>
    </div>

    <div v-else>
      <div>
        <q-card
          flat
          class="q-my-md"
          style="border-radius: 16px; width: fit-content"
          :class="`day-bg-${extractDateParts(itineraryStore.selectedDay!.id)!.day.toLowerCase()}`"
        >
          <q-card-section class="row no-wrap items-center">
            <!-- Left: Date -->
            <div class="q-pa-md flex column items-center justify-center">
              <q-icon name="event" size="32px" />
              <div class="text-h4">{{ date?.date }}</div>
              <div class="text-subtitle2">{{ date?.month }}</div>
            </div>

            <!-- Right: Info -->
            <div class="q-pa-sm q-pl-md col">
              <div class="text-subtitle1">{{ tripStore.activeTrip?.name }}</div>

              <div class="text-body2 q-mt-xs">
                Events today: <strong>{{ itineraryStore.selectedDay!.events.length }}</strong>
              </div>

              <div class="text-body2 q-mt-sm">
                {{ date?.day }}, {{ date?.date }} {{ date?.month }} {{ date?.year }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div>
        <q-btn
          v-if="!showAddDialog"
          color="primary"
          label="Add Event"
          @click="showAddDialog = true"
        />
      </div>
      <div v-if="showAddDialog" class="q-pa-md shadow-4" style="border-radius: 12px">
        <div class="full-width text-right">
          <q-btn dense flat size="sm" icon="close" class="q-mb-sm" @click="showAddDialog = false" />
        </div>
        <q-form @submit.prevent="onSubmit" @reset="onReset" class="">
          <div class="row q-col-gutter-md">
            <!-- Column 1 -->
            <div class="col-12 col-md-6 col-lg-4">
              <div class="q-gutter-sm">
                <q-input
                  v-model="form.name"
                  label="Event Name"
                  filled
                  dense
                  square
                  clearable
                  required
                  :rules="[(val) => !!val || 'Event name is required']"
                />

                <q-input
                  v-model="form.description"
                  label="Description"
                  type="textarea"
                  filled
                  dense
                  square
                  autogrow
                  clearable
                />

                <q-input
                  v-model="form.startTime"
                  label="Start Time"
                  type="datetime-local"
                  filled
                  dense
                  square
                  clearable
                  required
                />

                <q-input
                  v-model="form.endTime"
                  label="End Time"
                  type="datetime-local"
                  filled
                  dense
                  square
                  clearable
                />
              </div>
            </div>

            <!-- Column 2 -->
            <div class="col-12 col-md-6 col-lg-4">
              <div class="q-gutter-sm">
                <q-input
                  v-model="form.locationName"
                  label="Location Name"
                  filled
                  dense
                  square
                  clearable
                />

                <q-input v-model="form.address" label="Address" filled dense square clearable />

                <div>
                  <MapPicker :initial-location="initialLocation" @picked="onLocationPicked" />
                </div>
              </div>
            </div>

            <!-- Column 3 -->
            <div class="col-12 col-md-12 col-lg-4">
              <div class="q-gutter-sm">
                <q-select
                  v-model="form.category"
                  :options="categoryOptions"
                  option-label="label"
                  option-value="value"
                  label="Category"
                  filled
                  dense
                  square
                  clearable
                  required
                />

                <q-select
                  v-model="form.assignedTo"
                  :options="userOptions"
                  label="Assigned To"
                  multiple
                  use-chips
                  option-value="uid"
                  option-label="displayName"
                  map-options
                  emit-value
                  filled
                  dense
                  square
                  clearable
                />

                <q-select
                  v-model="form.packingItemsNeeded"
                  :options="packingItemOptions"
                  label="Packing Items Needed"
                  multiple
                  use-chips
                  filled
                  dense
                  square
                  clearable
                />

                <q-input
                  v-model.number="form.budgetImpact!.estimatedCost"
                  label="Estimated Cost"
                  type="number"
                  prefix="$"
                  filled
                  dense
                  square
                  clearable
                />

                <q-input
                  v-model="form.notes"
                  label="Notes"
                  type="textarea"
                  filled
                  dense
                  square
                  autogrow
                  clearable
                />
              </div>
            </div>

            <!-- Buttons -->
            <div class="col-12 q-pt-md text-right">
              <q-btn type="reset" color="grey" flat icon="restart_alt" />
              <q-btn type="submit" color="primary" flat icon="send" class="q-mr-sm" />
            </div>
          </div>
        </q-form>
      </div>
      {{ itineraryStore.selectedDay!.events }}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useItineraryStore } from '../store';
import { useRoute } from 'vue-router';
import type { ItineraryEvent } from '../store/types';
import { ItineraryEventCategory } from '../store/types';
import { useTripStore } from 'src/modules/trip/store';
import MapPicker from 'src/components/MapPicker.vue';
import { extractDateParts } from 'src/utils/date';
import { useAuthStore } from 'src/modules/auth/store';
const authStore = useAuthStore();

const tripStore = useTripStore();

const route = useRoute();
const initialLocation = ref();
const showAddDialog = ref(false);

const itineraryStore = useItineraryStore();
const tripId = ref();
const itineraryDay = ref();
const date = ref();
onMounted(async () => {
  tripId.value = route.params.id as string;
  itineraryDay.value = route.params.dayId as string;

  const response = await itineraryStore.fetchItineraryDay(tripId.value, itineraryDay.value);
  initialLocation.value = tripStore.activeTrip?.location;
  await tripStore.fetchTrip(tripId.value);

  console.log(response);

  date.value = extractDateParts(itineraryStore.selectedDay!.id);
  const involvedUsersId = tripStore.activeTrip?.involvedUsers || [];
  const allUsers = authStore.allUsers || [];

  const involvedUsers = allUsers.filter((user) => involvedUsersId.includes(user.uid));
  userOptions.value = involvedUsers;
  console.log(userOptions.value);
});

const form = ref<ItineraryEvent>({
  id: '',
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  locationName: '',
  address: '',
  coordinates: {
    latitude: 0,
    longitude: 0,
  },
  category: ItineraryEventCategory.Other,
  assignedTo: [],
  isCompleted: false,
  packingItemsNeeded: [],
  budgetImpact: {
    estimatedCost: 0,
  },
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const categoryOptions = Object.values(ItineraryEventCategory);

const userOptions = ref();
const packingItemOptions = ['Passport', 'Camera', 'Sunscreen', 'Snacks'];

async function onSubmit() {
  console.log('Submitted', form.value);
  const response = await itineraryStore.addItineraryEvent(
    tripId.value,
    itineraryStore.selectedDay!.id,
    form.value,
  );
  console.log('this is the response ', response);
  // Add actual submit logic here
}

function onReset() {
  form.value = {
    id: '',
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    locationName: '',
    address: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: ItineraryEventCategory.Other,
    assignedTo: [],
    isCompleted: false,
    packingItemsNeeded: [],
    budgetImpact: {
      estimatedCost: 0,
    },
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

async function onLocationPicked(coords: object) {
  const newLocation = {
    name: tripStore.activeTrip?.location.name,
    ...coords,
  };
  const payload = {
    location: newLocation,
  };

  await updateTripDetails(id.value, payload);
  initialLocation.value = newLocation;
  // e.g., save to form, update store, etc.
}
</script>

<style scoped></style>
