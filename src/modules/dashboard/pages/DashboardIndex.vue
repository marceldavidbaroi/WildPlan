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

    <!-- add trip button  -->
    <div>
      <q-btn color="primary" text-color="white" label="Add trip" icon="add" @click="onAddClick" />
      <AddTripComponent
        v-model="showAddTripPopup"
        @submit="handleCreateTrip"
        @close="showAddTripPopup = false"
      />
    </div>
    this is the card
    <SwipeCard :cards="tripStore.trips || []" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AddTripComponent from '../components/AddTripComponent.vue';
import type { TripCreateData } from '../../trip/store/types';
import { useTripStore } from '../../trip/store';
import SwipeCard from '../components/SwipeCard.vue';
import { useAuthStore } from 'src/modules/auth/store';
const authStore = useAuthStore();

const tripStore = useTripStore();

const showAddTripPopup = ref(false);
const onAddClick = () => {
  showAddTripPopup.value = true;
};

async function handleCreateTrip(data: TripCreateData) {
  console.log('Trip created:', data);
  const response = await tripStore.createTrip(data);
  console.log(response);

  // You can now call a service to save to Firebase
}
// Static sample trips data (replace with Firestore data later)

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

// const cardData = [
//   {
//     id: 1,
//     title: 'Sunset Vibes',
//     subtitle: 'Beautiful orange sky',
//     image:
//       'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
//   },
//   {
//     id: 2,
//     title: 'Mountain Peak',
//     subtitle: 'Snow capped mountains',
//     image:
//       'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=80',
//   },
//   {
//     id: 3,
//     title: 'Forest Walk',
//     subtitle: 'Sunlight through trees',
//     image:
//       'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
//   },
// ];

onMounted(async () => {
  await tripStore.fetchTrips({});
  await authStore.fetchAllUser();
  console.log('all user', authStore.allUsers);
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
