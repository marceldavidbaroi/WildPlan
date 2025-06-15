<template>
  <q-page class="q-pa-md">
    <!-- Weather & Date Row -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1">
        🌤️ Sunny 24°C
        <!-- Replace with your weather API data -->
      </div>
      <div class="text-subtitle2 text-grey-7">
        {{ currentDate }}
      </div>
    </div>

    <!-- Trips Card Slideshow -->
    <q-carousel
      navigation
      arrows
      animated
      swipeable
      height="220px"
      control-color="primary"
      control-text-color="primary"
    >
      <q-carousel-slide v-for="trip in trips" :key="trip.id" :name="trip.id">
        <q-card class="q-ma-sm bg-white text-primary">
          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ trip.title }}</div>
            <div class="text-subtitle2">{{ trip.description }}</div>
            <div class="text-caption q-mt-xs">Dates: {{ trip.startDate }} - {{ trip.endDate }}</div>
          </q-card-section>
        </q-card>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Static sample trips data (replace with Firestore data later)
const trips = ref([
  {
    id: 'trip1',
    title: 'Weekend at Pine Forest',
    description: 'Explore hiking trails and camp by the lake',
    startDate: '2025-07-10',
    endDate: '2025-07-12',
  },
  {
    id: 'trip2',
    title: 'Mountain Adventure',
    description: 'Backpacking in the Rocky Mountains',
    startDate: '2025-08-01',
    endDate: '2025-08-07',
  },
  {
    id: 'trip3',
    title: 'Beachside Camping',
    description: 'Relax by the ocean and enjoy campfires',
    startDate: '2025-09-15',
    endDate: '2025-09-18',
  },
]);

// Current date formatted
const currentDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date().toLocaleDateString(undefined, options);
});
</script>

<style scoped>
/* Optional: minimal styling */
.q-carousel-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

q-card {
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
}
</style>
