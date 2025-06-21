<template>
  <q-page padding>
    <div class="q-gutter-md">
      <!-- Header -->
      <div class="row justify-between items-center">
        <div class="">
          <q-btn flat icon="sort" color="primary" @click="onFilterClick">
            <q-tooltip class="bg-primary">Filters</q-tooltip>
          </q-btn>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn flat icon="add" color="primary" @click="onAddClick">
            <q-tooltip class="bg-primary">Add Trip</q-tooltip>
          </q-btn>
        </div>
      </div>
      <!-- filter -->

      <div v-if="showFilters" class="q-gutter-md q-pa-md bg-transparent rounded-borders">
        <div class="row q-col-gutter-md items-center q-mb-sm">
          <!-- Search -->
          <q-input
            v-model="searchQuery"
            debounce="300"
            dense
            outlined
            placeholder="Search trips..."
            class="col-12 col-md-4"
            @update:model-value="onSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Sort By -->
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            label="Sort by"
            dense
            outlined
            emit-value
            map-options
            class="col-6 col-md-3"
            @update:model-value="onSortChange"
          />

          <!-- Status Filter -->
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Filter status"
            dense
            outlined
            emit-value
            map-options
            class="col-6 col-md-3"
            @update:model-value="onFilterChange"
          />

          <!-- Rows Per Page -->
          <q-select
            v-model="rowsPerPage"
            :options="[5, 10, 20]"
            label="Rows per page"
            dense
            outlined
            class="col-6 col-md-2"
            @update:model-value="onRowsPerPageChange"
          />
        </div>
      </div>

      <!-- Add Trip Dialog -->
      <AddTripComponent
        v-model="showAddTripPopup"
        :allusers="allUsers || []"
        @submit="handleCreateTrip"
        @close="showAddTripPopup = false"
      />

      <!-- Trips Display -->
      <div v-if="loading" class="q-my-xl flex flex-center">
        <q-spinner-ball size="lg" color="primary" />
      </div>
      <div v-else>
        <TripCard :trips="trips" />

        <div class="q-pa-lg flex flex-center">
          <q-pagination
            v-model="page"
            :max="Math.ceil(totalItems / rowsPerPage)"
            max-pages="5"
            flat
            color="primary"
            active-color="primary"
            boundary-links
            direction-links
            :icons="false"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Notify } from 'quasar';

import { useTripStore } from '../store';
import TripCard from '../components/TripCard.vue';
import AddTripComponent from 'src/components/AddTripComponent.vue';

import type { Trip, TripCreateData } from '../../trip/store/types';
import type { UserProfile } from '../../auth/store/types';
import { useAuthStore } from 'src/modules/auth/store';

const tripStore = useTripStore();
const authStore = useAuthStore();
const trips = ref<Trip[]>([]);
const allUsers = ref<UserProfile[]>(authStore.allUsers || []);

const page = ref(1);
const rowsPerPage = ref(10);
const totalItems = ref(0);
const lastVisibleDoc = ref<QueryDocumentSnapshot<DocumentData> | null>(null);

const loading = ref(false);
const showAddTripPopup = ref(false);
const searchQuery = ref('');
const sortBy = ref('name');
const statusFilter = ref('all');

const sortOptions = ref([
  { label: 'Name', value: 'name' },
  { label: 'Start Date', value: 'startDate' },
  { label: 'Created At', value: 'createdAt' },
  { label: 'Status', value: 'status' },
]);

const statusOptions = ref([
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]);

const onSortChange = async () => {
  page.value = 1;
  await fetchTripsPage();
};

const onFilterChange = async () => {
  page.value = 1;
  await fetchTripsPage();
};
// === Fetch Trips with Pagination ===
const fetchTripsPage = async () => {
  loading.value = true;

  const response = await tripStore.fetchTrips({
    limit: rowsPerPage.value,
    lastVisible: page.value === 1 ? null : lastVisibleDoc.value,
    searchQuery: searchQuery.value,
    sortBy: sortBy.value as 'name' | 'startDate' | 'status' | 'createdAt',
    statusFilter: statusFilter.value as 'upcoming' | 'completed' | 'cancelled' | 'all',
  });

  if (response.success && response.data) {
    trips.value = response.data;
    lastVisibleDoc.value = response.lastVisibleDoc ?? null;
    totalItems.value = page.value * rowsPerPage.value + (response.hasMore ? 1 : 0);
  } else {
    trips.value = [];
    totalItems.value = 0;
  }

  loading.value = false;
};

// === Event Handlers ===
const onAddClick = () => {
  showAddTripPopup.value = true;
};

const handleCreateTrip = async (data: TripCreateData) => {
  const response = await tripStore.createTrip(data);
  Notify.create({
    message: response.message,
    color: response.success ? 'positive' : 'negative',
  });
  await fetchTripsPage(); // refresh list after creation
};

const onSearch = async () => {
  page.value = 1;
  await fetchTripsPage();
};

const onRowsPerPageChange = async () => {
  page.value = 1;
  await fetchTripsPage();
};

const showFilters = ref(false);
const onFilterClick = () => {
  showFilters.value = !showFilters.value;
};
// === Reactive Page Watch ===
watch(page, fetchTripsPage);
onMounted(fetchTripsPage);
</script>

<style scoped></style>
