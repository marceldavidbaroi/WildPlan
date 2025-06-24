<template>
  <q-page padding>
    <div v-if="itineraryStore.isLoading" class="flex flex-center q-py-xl">
      <q-spinner-ball color="primary" size="xl" />
      <div class="text-h6 q-ml-md text-grey-7">Loading your itinerary...</div>
    </div>

    <div v-else>{{ itineraryStore.selectedDay }}</div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useItineraryStore } from '../store';
import { useRoute } from 'vue-router';
const route = useRoute();

const itineraryStore = useItineraryStore();
const tripId = ref();
const itineraryDay = ref();
onMounted(async () => {
  tripId.value = route.params.id as string;
  itineraryDay.value = route.params.dayId as string;

  const response = await itineraryStore.fetchItineraryDay(tripId.value, itineraryDay.value);
  console.log(response);
});
</script>

<style scoped></style>
