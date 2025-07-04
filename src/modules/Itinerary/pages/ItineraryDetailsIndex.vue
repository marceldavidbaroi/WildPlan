<template>
  <q-page padding class="q-gutter-y-md">
    <div v-if="fetchLoading" class="flex flex-center q-py-xl">
      <q-spinner-ball color="primary" size="xl" />
      <div class="text-h6 q-ml-md text-grey-7">Loading your itinerary...</div>
    </div>

    <div v-else>
      <div>
        <q-card class="my-card q-ma-md" style="border-radius: 12px">
          <q-card-section
            class="row q-pa-none"
            :class="$q.screen.lt.sm ? 'column' : 'row'"
            style="min-height: 90px"
          >
            <!-- Trip Image -->
            <q-img
              class="col-4"
              :ratio="$q.screen.lt.sm ? undefined : '16/9'"
              :style="
                $q.screen.lt.sm
                  ? 'height: 120px; border-top-left-radius: 12px; border-top-right-radius: 12px;'
                  : 'border-top-left-radius: 12px; border-bottom-left-radius: 12px; object-fit: cover;'
              "
              :src="tripStore.activeTrip?.photoURL"
            />

            <!-- Trip Details -->
            <div class="col q-pa-sm">
              <div class="column justify-between full-height">
                <!-- Trip Name -->
                <div class="text-subtitle1 text-primary q-mb-xs">
                  <q-icon name="travel_explore" class="q-mr-sm" />
                  {{ tripStore.activeTrip?.name }}
                </div>

                <!-- Involved Users -->
                <div class="text-caption text-grey-7 q-mb-xs">
                  <q-icon name="group" class="q-mr-sm" />
                  {{ tripStore.activeTrip?.involvedUsers.length }} Involved User(s)
                </div>

                <!-- Trip Dates -->
                <div class="text-caption text-grey-7">
                  <q-icon name="event" class="q-mr-sm" />
                  {{ formatDate(tripStore.activeTrip?.startDate) }} →
                  {{ formatDate(tripStore.activeTrip?.endDate) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="row justify-between">
        <div class="text-h6">Your Trip Itinerary</div>
        <div class="">
          <q-btn color="info" no-caps flat label="Preview" @click="onPreview" />
        </div>
      </div>
      <div>
        <q-banner
          v-if="(itineraryStore.itineraryDays.length === 0 || loadMoreDays) && isAdmin"
          class="bg-info text-white q-pa-md rounded-borders shadow-2"
          style="border-left: 5px solid #ffffffaa"
        >
          <div class="row items-center q-col-gutter-md">
            <q-icon name="event" size="md" class="q-mr-sm" />
            <div class="col">
              <div class="text-h6">Quick Add Travel Days</div>
              <div class="text-subtitle2 text-white text-opacity-80">
                Instantly populate each day of your trip with just one click!
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                dense
                no-caps
                size="md"
                color="white"
                text-color="primary"
                unelevated
                label="Add Days"
                :loading="dummyLoadingBtn"
                @click="addDummyDays"
              />
            </div>
          </div>
        </q-banner>
      </div>

      <div class="q-pa-md row items-start q-gutter-md">
        <q-card
          v-for="itineraryDay in itineraryStore.itineraryDays"
          :key="itineraryDay.id"
          class="my-card q-mb-md"
          :class="`day-bg-${extractDateParts(itineraryDay.date)?.day.toLowerCase()}`"
          @click="onClickItineraryDay(itineraryDay.id)"
        >
          <!-- Day of week (e.g., Monday) -->
          <q-card-section class="text-center q-py-sm">
            <q-icon name="event" class="q-mr-sm" />
            <span class="text-subtitle2 text-uppercase">
              {{ extractDateParts(itineraryDay.date)?.day }}
            </span>
          </q-card-section>

          <!-- Date, Month, Year -->
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <div class="col-6 text-h2 text-weight-bold">
                <q-icon name="calendar_today" class="q-mr-sm" />
                {{ extractDateParts(itineraryDay.date)?.date }}
              </div>
              <div class="col-6 text-right">
                <div class="text-subtitle1">
                  <q-icon name="date_range" class="q-mr-sm" />
                  {{ extractDateParts(itineraryDay.date)?.month }}
                </div>
                <div class="text-caption text-grey-9">
                  <q-icon name="history" class="q-mr-sm" />
                  {{ extractDateParts(itineraryDay.date)?.year }}
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
// import AddDialog from '../components/AddDialog.vue';
import { useTripStore } from 'src/modules/trip/store';
import { extractDateParts } from 'src/utils/date';
import { useAuthStore } from 'src/modules/auth/store';

const authStore = useAuthStore();
const tripStore = useTripStore();
const router = useRouter();

const route = useRoute();

const itineraryStore = useItineraryStore();
const tripId = ref<string>();
const startDate = ref();
const endDate = ref();
const allDaysofTrip = ref<string[] | undefined>([]);
const dayDiff = ref();
const loadMoreDays = ref(false);
const isAdmin = ref(false);

onMounted(async () => {
  tripId.value = route.params.id as string;
  startDate.value = tripStore.activeTrip?.startDate;
  endDate.value = tripStore.activeTrip?.endDate;
  allDaysofTrip.value = allDays();
  dayDiff.value =
    startDate.value && endDate.value
      ? Math.ceil(
          (new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) / 86400000,
        ) + 1
      : 0;

  loadMoreDays.value = itineraryStore.itineraryDays.length < dayDiff.value;
  await fetchAllItineraryDays();
  await tripStore.fetchTrip(tripId.value);
  if (tripStore.activeTrip?.roles?.length) {
    isAdmin.value = tripStore.activeTrip.roles.some(
      (r) => r.uid === authStore.profile!.uid && r.adminestrator === true,
    );
  }
});

async function onClickItineraryDay(val: string) {
  await router.push({ path: `/itinerary/${tripId.value}/day/${val}` });
}
// function extractDateParts(dateStr: string): {
//   date: number;
//   month: string;
//   year: number;
//   day: string;
// } {
//   const dateObj = new Date(dateStr);

//   return {
//     date: dateObj.getDate(),
//     month: dateObj.toLocaleString('default', { month: 'short' }), // e.g., "Jun"
//     year: dateObj.getFullYear(),
//     day: dateObj.toLocaleString('default', { weekday: 'long' }), // e.g., "Thursday"
//   };
// }

const fetchLoading = ref(false);

const fetchAllItineraryDays = async () => {
  fetchLoading.value = true;

  const response = await itineraryStore.getAllDays(tripId.value!);

  // Only create if no itinerary days exist yet
  Notify.create({
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
    position: 'top',
  });

  fetchLoading.value = false;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
function allDays() {
  if (!startDate.value || !endDate.value) {
    console.warn('Start date or end date is missing');
    return;
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  // Add 1 day to end date
  end.setDate(end.getDate() + 1);

  const dates: string[] = [];

  const current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]!);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
const dummyLoadingBtn = ref(false);
async function addDummyDays() {
  dummyLoadingBtn.value = true;
  for (const day of allDaysofTrip.value!) {
    await itineraryStore.createDay(tripId.value!, day);
  }
  loadMoreDays.value = false;
  await fetchAllItineraryDays();

  dummyLoadingBtn.value = false;
}
const onPreview = () => {
  const url = router.resolve({
    path: '/external/trip_days',
    query: { tripId: tripId.value },
  }).href;

  window.open(url, '_blank'); // Opens in a new tab or window
};
</script>

<style scoped>
/* Soft pastel background colors for each day */
/* Light mode: Soft pastel backgrounds */

/* Common styles */
.my-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
