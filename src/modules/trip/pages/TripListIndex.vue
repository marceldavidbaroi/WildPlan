<template>
  <q-page padding>
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
    <TripCard :trips="tripStore.trips || []" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useTripStore } from '../store';
import type { TripCreateData } from '../../trip/store/types';
import type { UserProfile } from '../../auth/store/types';
import TripCard from '../components/TripCard.vue';
import AddTripComponent from 'src/components/AddTripComponent.vue';
import { Notify } from 'quasar';

const showAddTripPopup = ref(false);

const tripStore = useTripStore();
const allUsers = ref<UserProfile[]>();

onMounted(async () => {
  await tripStore.fetchTrips({});
  console.log(tripStore.trips);
});

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
</script>

<style scoped></style>
