<template>
  <q-page padding class="q-gutter-y-md">
    <div v-if="fetchLoading" class="flex flex-center q-py-xl">
      <q-spinner-ball color="primary" size="xl" />
      <div class="text-h6 q-ml-md text-grey-7">Loading your itinerary...</div>
    </div>

    <div v-else>
      <div class="q-mt-xl">
        <AddDialog :trip-id="tripId || ''" :start-date="startDate" :end-date="endDate" />
      </div>
      <div class="text-h4 text-weight-bold q-mb-lg">Your Trip Itinerary</div>

      <div class="q-pa-md row items-start q-gutter-md">
        <q-card
          v-for="itineraryDay in itineraryStore.itineraryDays"
          :key="itineraryDay.id"
          class="my-card q-mb-md"
          :class="`day-bg-${extractDateParts(itineraryDay.date).day.toLowerCase()}`"
          @click="onClickItineraryDay(itineraryDay.id)"
        >
          <!-- Day of week (e.g., Monday) -->
          <q-card-section class="text-center q-py-sm">
            <q-icon name="event" class="q-mr-sm" />
            <span class="text-subtitle2 text-uppercase">
              {{ extractDateParts(itineraryDay.date).day }}
            </span>
          </q-card-section>

          <!-- Date, Month, Year -->
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <div class="col-6 text-h2 text-weight-bold">
                <q-icon name="calendar_today" class="q-mr-sm" />
                {{ extractDateParts(itineraryDay.date).date }}
              </div>
              <div class="col-6 text-right">
                <div class="text-subtitle1">
                  <q-icon name="date_range" class="q-mr-sm" />
                  {{ extractDateParts(itineraryDay.date).month }}
                </div>
                <div class="text-caption text-grey-9">
                  <q-icon name="history" class="q-mr-sm" />
                  {{ extractDateParts(itineraryDay.date).year }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useItineraryStore } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { Notify } from 'quasar';
import AddDialog from '../components/AddDialog.vue';
import { useTripStore } from 'src/modules/trip/store';
const tripStore = useTripStore();
const router = useRouter();

const route = useRoute();

const itineraryStore = useItineraryStore();
const tripId = ref<string>();
const startDate = ref();
const endDate = ref();

onMounted(async () => {
  console.log(route.params.id);
  tripId.value = route.params.id as string;
  await fetchAllItineraryDays();
  await tripStore.fetchTrip(tripId.value);
  console.log('Trip fetched:', tripStore.activeTrip);
  startDate.value = tripStore.activeTrip?.startDate;
  endDate.value = tripStore.activeTrip?.endDate;
});

function extractDateParts(dateStr: string): {
  date: number;
  month: string;
  year: number;
  day: string;
} {
  const dateObj = new Date(dateStr);

  return {
    date: dateObj.getDate(),
    month: dateObj.toLocaleString('default', { month: 'short' }), // e.g., "Jun"
    year: dateObj.getFullYear(),
    day: dateObj.toLocaleString('default', { weekday: 'long' }), // e.g., "Thursday"
  };
}

const fetchLoading = ref(false);
const fetchAllItineraryDays = async () => {
  fetchLoading.value = true;
  if (!tripId.value) {
    return;
  }
  const response = await itineraryStore.fetchItineraryDaysForTrip(tripId.value);

  console.log('All itinerary days fetched:', response);
  Notify.create({
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
    position: 'top',
  });

  fetchLoading.value = false;
};

async function onClickItineraryDay(dayId: string) {
  console.log('Clicked itinerary day with ID:', dayId);
  await router.push({ path: `/itinerary/${tripId.value}/day/${dayId}` });
}
</script>

<style scoped>
/* Soft pastel background colors for each day */
/* Light mode: Soft pastel backgrounds */
.day-bg-monday {
  background-color: #e3f2fd;
}
.day-bg-tuesday {
  background-color: #fce4ec;
}
.day-bg-wednesday {
  background-color: #e8f5e9;
}
.day-bg-thursday {
  background-color: #fff3e0;
}
.day-bg-friday {
  background-color: #f3e5f5;
}
.day-bg-saturday {
  background-color: #fbe9e7;
}
.day-bg-sunday {
  background-color: #ede7f6;
}

/* Dark mode overrides */
body.body--dark .day-bg-monday {
  background-color: rgba(33, 150, 243, 0.1); /* darker blue tone */
}
body.body--dark .day-bg-tuesday {
  background-color: rgba(233, 30, 99, 0.1); /* pink tone */
}
body.body--dark .day-bg-wednesday {
  background-color: rgba(76, 175, 80, 0.1); /* green tone */
}
body.body--dark .day-bg-thursday {
  background-color: rgba(255, 152, 0, 0.1); /* orange tone */
}
body.body--dark .day-bg-friday {
  background-color: rgba(156, 39, 176, 0.1); /* purple tone */
}
body.body--dark .day-bg-saturday {
  background-color: rgba(244, 67, 54, 0.1); /* red tone */
}
body.body--dark .day-bg-sunday {
  background-color: rgba(103, 58, 183, 0.1); /* indigo tone */
}

/* Common styles */
.my-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s ease;
}
</style>
