<template>
  <q-page padding class="">
    <div v-if="pageloading" class="flex flex-center q-mb-md">
      <q-spinner-ball color="primary" size="md" />
    </div>
    <q-card v-else class="rounded-borders">
      <!-- Image & Content -->
      <div class="row q-col-gutter-x-md">
        <!-- Trip Image -->
        <div class="col-12 col-md-5">
          <q-img :src="trip?.photoURL || fallbackImage" :alt="trip?.name" class="rounded-borders" />
        </div>

        <!-- Trip Info -->
        <div class="col-12 col-md-7">
          <q-card-section>
            <div class="text-h6 text-primary">
              {{ tripStore.activeTrip?.name || 'Trip Title' }}
            </div>
            <div class="text-subtitle2 text-grey">
              {{ tripStore.activeTrip?.location?.name || 'Unknown Location' }}
            </div>

            <div class="q-mt-sm">
              <q-icon name="event" class="q-mr-xs" />
              {{ formattedDate }}
            </div>

            <div class="q-mt-sm">
              <q-icon name="group" class="q-mr-xs" />
              {{ tripStore.activeTrip?.members?.length || 0 }} member(s)
            </div>
          </q-card-section>

          <q-card-actions align="left" class="">
            <q-btn
              color="primary"
              label="Join Trip"
              @click="onJoin"
              icon="person_add"
              class="q-mt-sm"
              :loading="loading"
            />
          </q-card-actions>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../store';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/modules/auth/store';
const authStore = useAuthStore();
const router = useRouter();

const route = useRoute();
const tripStore = useTripStore();

const fallbackImage = 'https://cdn.quasar.dev/img/parallax2.jpg';
const trip = computed(() => tripStore.activeTrip);
const loading = computed(() => tripStore.loading);
const pageloading = ref<boolean>(false);
onMounted(() => {
  pageloading.value = true;
  const tripId = route.params.id as string;
  tripStore.fetchTrip(tripId);
  pageloading.value = false;
});

// Format the date range
const formattedDate = computed(() => {
  const start = tripStore.activeTrip?.startDate;
  const end = tripStore.activeTrip?.endDate;
  return start && end ? `${start} → ${end}` : 'Dates not set';
});

async function updateTripDetails(id: string, payload: object) {
  const response = await tripStore.updateTrip(id, payload);
  Notify.create({
    position: 'top',
    message: 'your request will be processed shortly',
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });
}

async function onJoin() {
  if (trip.value?.involvedUsers.includes(authStore.profile!.uid)) {
    Notify.create({
      type: 'info',
      message: 'You are already a member of this trip.',
      position: 'top',
    });
    router.push({ path: `/trip/${trip.value.id}` });
    return;
  }

  const joinRquests = [...(trip.value?.joinRquests || [])];

  if (joinRquests.some((u) => u.uid === authStore.profile!.uid)) {
    Notify.create({
      type: 'info',
      message: 'You have already requested to join this trip.',
      position: 'top',
    });
    return;
  }

  joinRquests.push({
    uid: authStore.profile!.uid,
    displayName: authStore.profile!.displayName || 'Unknown User',
    email: authStore.profile!.email || 'No Email',
  });

  const payload = {
    joinRquests,
  };

  await updateTripDetails(trip.value!.id, payload);
}
</script>

<style scoped>
.my-card {
  max-width: 900px;
  margin: auto;
}
.rounded-borders {
  border-radius: 12px;
}
</style>
