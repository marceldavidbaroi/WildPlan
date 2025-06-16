<template>
  <q-page padding>
    this is the page

    <TripCard :trips="tripStore.trips || []" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTripStore } from '../store';
import TripCard from '../components/TripCard.vue';

const tripStore = useTripStore();

onMounted(async () => {
  await tripStore.fetchTrips({});
  console.log(tripStore.trips);
});
</script>

<style scoped></style>
