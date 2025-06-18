<template>
  <q-page class="q-pa-md">
    <!-- Weather & Date Row -->
    <div v-if="!loading">
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
      <div class="row justify-end">
        <q-btn flat color="primary" icon="add" @click="onAddClick">
          <q-tooltip anchor="top middle" self="bottom middle" class="bg-secondary text-white">
            Add Trip
          </q-tooltip>
        </q-btn>
        <AddTripComponent
          v-model="showAddTripPopup"
          :allusers="allUsers || []"
          @submit="handleCreateTrip"
          @close="showAddTripPopup = false"
        />
      </div>
      <SwipeCard :cards="tripStore.trips || []" />
    </div>
    <div v-else class="absolute-full flex flex-center bg-transparent">
      <q-spinner-ball color="primary" size="lg" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AddTripComponent from 'src/components/AddTripComponent.vue';
import type { TripCreateData } from '../../trip/store/types';
import type { UserProfile } from '../../auth/store/types';
import { useTripStore } from '../../trip/store';
import SwipeCard from '../components/SwipeCard.vue';
import { useAuthStore } from 'src/modules/auth/store';
import { Notify } from 'quasar';

const authStore = useAuthStore();

const tripStore = useTripStore();

const allUsers = ref<UserProfile[]>();

const showAddTripPopup = ref(false);
const onAddClick = () => {
  showAddTripPopup.value = true;
};

async function handleCreateTrip(data: TripCreateData) {
  const response = await tripStore.createTrip(data);
  Notify.create({
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });

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

const loading = ref<boolean>(false);
onMounted(async () => {
  loading.value = true;
  await tripStore.fetchTrips({});
  await authStore.fetchAllUser();
  allUsers.value = authStore.allUsers?.filter((u) => u.email !== authStore.user?.email);

  loading.value = false;
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
