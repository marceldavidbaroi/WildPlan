<template>
  <q-page padding>
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner-ball color="primary" size="xl" />
      <div class="text-h6 q-ml-md text-grey-7">Loading your itinerary...</div>
    </div>

    <div v-else>
      <div>
        <q-btn
          color="warning"
          flat
          dense
          icon="arrow_back"
          @click="router.push({ path: `/itinerary/${tripId}` })"
        />
        <q-card
          flat
          class="q-my-md"
          style="border-radius: 16px; width: fit-content"
          :class="`day-bg-${date?.day.toLowerCase()}`"
        >
          <q-card-section class="row no-wrap items-center">
            <!-- Left: Date -->
            <div class="q-pa-md flex column items-center justify-center">
              <q-icon name="event" size="32px" />
              <div class="text-h4">{{ date?.date }}</div>
              <div class="text-subtitle2">{{ date?.month }}</div>
            </div>

            <!-- Right: Info -->
            <div class="q-pa-sm q-pl-md col">
              <div class="text-subtitle1">{{ tripStore.activeTrip?.name }}</div>

              <div class="text-body2 q-mt-xs">
                Events today: <strong>{{ itineraryStore.selectedDay?.events.length }}</strong>
              </div>

              <div class="text-body2 q-mt-sm">
                {{ date?.day }}, {{ date?.date }} {{ date?.month }} {{ date?.year }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div>
        <div class="full-width row justify-end q-gutter-sm">
          <q-btn color="info" no-caps flat label="Preview" @click="onPreview" />
          <div v-if="isAdmin" class="q-gutter-sm">
            <q-btn
              v-if="itineraryStore.selectedDay?.inputSource !== null"
              color="negative"
              no-caps
              label="Delete All"
              @click="onDeleteAll"
            />
            <q-btn
              v-if="itineraryStore.selectedDay?.inputSource === 'scheduler'"
              color="primary"
              no-caps
              label="Make Schedule"
              @click="onScheduleClick"
            />
            <q-btn
              v-if="itineraryStore.selectedDay?.inputSource === 'manual'"
              color="primary"
              no-caps
              label="Add Event"
              @click="
                {
                  (showAddDialog = true), (isEdit = false);
                }
              "
            />
          </div>
        </div>

        <AddEventDialog
          :show="showAddDialog"
          :form="form"
          :tripId="tripId ?? ''"
          :initial-location="initialLocation"
          :category-options="categoryOptions"
          :user-options="userOptions"
          :packing-item-options="packingItemOptions"
          :isEdit="isEdit"
          :packingItems="packingItems"
          @update:show="(val) => (showAddDialog = val)"
          @submit="handleSubmit"
        />
      </div>

      <div>
        <div
          v-if="itineraryStore.selectedDay?.events.length === 0"
          class="q-pa-md flex flex-center"
        >
          <q-card class="q-pa-lg q-mx-auto" style="max-width: 400px">
            <q-card-section class="text-center">
              <q-icon name="event_busy" size="48px" color="grey-6" />
              <div class="text-h6 q-mt-md">No Events Scheduled</div>
              <div class="text-subtitle2 q-mt-xs">Start by choosing how to plan your day.</div>
            </q-card-section>

            <q-separator v-if="itineraryStore.selectedDay?.inputSource === null" spaced />

            <q-card-section v-if="itineraryStore.selectedDay?.inputSource === null">
              <q-btn
                color="primary"
                icon="edit"
                label="Add Event Individually"
                class="full-width q-mb-sm"
                @click="onClickIndividualorSchedule({ inputSource: 'manual' })"
              />
              <q-btn
                color="secondary"
                icon="event"
                label="Use Scheduler"
                class="full-width"
                @click="onClickIndividualorSchedule({ inputSource: 'scheduler' })"
              />
            </q-card-section>
          </q-card>
        </div>
        <div v-else>
          <div v-for="event in itineraryStore.selectedDay?.events" :key="event.id">
            <div class="shadow-1 q-my-sm q-pa-md" style="border-radius: 12px">
              <div v-if="!editLoading" class="row justify-between">
                <div @click="onDetailsClick(event)" style="cursor: pointer">
                  <q-icon :name="getCategoryIcon(event.category)" class="q-mr-sm" />
                  <span class="text-bold"
                    >{{ event.startTime }}&nbsp;-&nbsp;{{ event.endTime }}</span
                  >
                  $&nbsp;&nbsp;-&nbsp;&nbsp;
                  {{ event.name }}
                </div>
                <div>
                  <q-btn
                    color="secondary"
                    flat
                    dense
                    size="sm"
                    no-caps
                    :loading="btnLoading"
                    :label="event.isCompleted ? 'Complete' : 'Mark as Complete'"
                    @click="onClickMarkAsComplete(event)"
                  />
                  <q-btn color="info" flat dense size="sm" icon="edit" @click="onEdit(event)" />
                  <q-btn
                    color="negative"
                    flat
                    dense
                    size="sm"
                    icon="delete"
                    @click="onDelete(event)"
                  />
                </div>
              </div>
              <div v-else class="flex flex-center">
                <q-spinner-bars size="sm" color="primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DeleteDialog
      v-model="showDeleteDialog"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      message="Are you sure you want to delete this event"
      :loading="itineraryStore.isLoading"
    />

    <EventDetailsDialog v-model="showDetails" :event="selectedEvent" />
    <DeleteDialog
      v-model="showDeleteAllDialog"
      @confirm="handleConfirmAll"
      @cancel="handleCancelAll"
      message="Are you sure you want to delete all events "
      :loading="itineraryStore.isLoading"
    />
  </q-page>
</template>

<script setup lang="ts">
/* ───── Imports ───── */
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useItineraryStore } from '../store';
import { useTripStore } from 'src/modules/trip/store';
import { useAuthStore } from 'src/modules/auth/store';

import { extractDateParts } from 'src/utils/date';
import type { ItineraryEvent, NewItineraryEvent } from '../store/types';
import { ItineraryEventCategory } from '../store/types';

import AddEventDialog from '../components/AddEventDialog.vue';
import DeleteDialog from 'src/components/DeleteDialog.vue';
import EventDetailsDialog from '../components/EventDetailsDialog.vue';
import { Notify } from 'quasar';
import { usePackingStore } from 'src/modules/packing/store';

/* ───── Store Instances ───── */
const itineraryStore = useItineraryStore();
const tripStore = useTripStore();
const authStore = useAuthStore();
const packingStore = usePackingStore();
const router = useRouter();

/* ───── Refs and State ───── */
const route = useRoute();
const tripId = ref<string>();
const itineraryDay = ref<string>();
const date = ref();
const initialLocation = ref();
const showDetails = ref<boolean>(false);

const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const isEdit = ref(false);
const selectedEventDel = ref();
const selectedEventId = ref();
const selectedEvent = ref();
const btnLoading = ref<boolean>(false);
const loading = ref<boolean>(false);
const packingItems = ref();
const isAdmin = ref(false);
const editLoading = ref(false);

const userOptions = ref();
const categoryOptions = Object.values(ItineraryEventCategory);
const packingItemOptions = [
  'none',
  'Passport',
  'Camera',
  'Sunscreen',
  'Snacks',
  'Travel Adapter',
  'Phone Charger',
  'Headphones',
  'Travel Pillow',
  'Toothbrush',
  'Toothpaste',
  'Medications',
  'First Aid Kit',
  'Reusable Water Bottle',
  'Travel Documents',
  'Credit Card',
  'Cash',
  'Guidebook',
  'Sunglasses',
  'Hat',
  'Rain Jacket',
  'Comfortable Shoes',
  'Swimsuit',
  'Clothing',
  'Hand Sanitizer',
  'Wet Wipes',
  'Luggage Lock',
];

/* ───── Form Data ───── */
const form = ref<ItineraryEvent>({
  id: '',
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  locationName: '',
  address: '',
  coordinates: {
    latitude: 0,
    longitude: 0,
  },
  category: ItineraryEventCategory.Other,
  assignedTo: [],
  isCompleted: false,
  packingItemsNeeded: [],
  budgetImpact: {
    estimatedCost: 0,
  },
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/* ───── Lifecycle ───── */
onMounted(async () => {
  loading.value = true;
  tripId.value = route.params.id as string;
  itineraryDay.value = route.params.dayId as string;

  await itineraryStore.getDay(tripId.value, itineraryDay.value);
  await tripStore.fetchTrip(tripId.value);
  await authStore.fetchAllUser();

  initialLocation.value = tripStore.activeTrip?.location;

  const involvedUsersId = tripStore.activeTrip?.involvedUsers || [];

  const allUsers = authStore.allUsers || [];
  userOptions.value = allUsers.filter((user) => involvedUsersId.includes(user.uid));
  date.value = extractDateParts(itineraryStore.selectedDay!.id);
  await packingStore.getPackingItems({ tripId: tripId.value });
  packingItems.value = packingStore.items.filter((item) => item.type === 'shared');
  if (tripStore.activeTrip?.roles?.length) {
    isAdmin.value = tripStore.activeTrip.roles.some(
      (r) => r.uid === authStore.profile!.uid && r.adminestrator === true,
    );
  }
  loading.value = false;
});

/* ───── Handlers ───── */
function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'activity':
      return 'directions_run';
    case 'meal':
      return 'restaurant';
    case 'travel':
      return 'commute';
    case 'lodging':
      return 'hotel';
    case 'campchore':
      return 'construction';
    case 'meeting':
      return 'groups';
    case 'relaxation':
      return 'spa';
    case 'other':
      return 'more_horiz';
    default:
      return 'event_note';
  }
}

async function handleSubmit(val: NewItineraryEvent) {
  let response = null;
  if (isEdit.value) {
    editLoading.value = true;
    response = await itineraryStore.editEventById(
      tripId.value!,
      itineraryStore.selectedDay!.id,
      selectedEventId.value,
      val,
    );
    editLoading.value = false;
  } else {
    response = await itineraryStore.addEvent(tripId.value!, itineraryStore.selectedDay!.id, val);
  }

  if (response.success) {
    await itineraryStore.getDay(tripId.value!, itineraryDay.value!);
  }
  Notify.create({
    position: 'top',
    message: response?.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });

  isEdit.value = false;
  showAddDialog.value = false;
}

function onEdit(event: ItineraryEvent) {
  selectedEventId.value = event.id;
  isEdit.value = true;
  showAddDialog.value = true;
  form.value = event;
}

function onDelete(val: object) {
  selectedEventDel.value = val;
  showDeleteDialog.value = true;
}

async function handleConfirm() {
  const response = await itineraryStore.removeEventById(
    tripId.value!,
    itineraryStore.selectedDay!.id,
    selectedEventDel.value.id,
  );

  if (response?.success) {
    await itineraryStore.getDay(tripId.value!, itineraryDay.value!);
  }
  Notify.create({
    position: 'top',
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });
  showDeleteDialog.value = false;
}

function handleCancel() {
  showDeleteDialog.value = false;
}

async function handleConfirmAll() {
  const response = await itineraryStore.deleteAllEvents(
    tripId.value!,
    itineraryStore.selectedDay!.id,
  );

  if (response?.success) {
    await itineraryStore.getDay(tripId.value!, itineraryDay.value!);
    await itineraryStore.updateDayField(tripId.value!, itineraryStore.selectedDay!.id, {
      inputSource: null,
    });
  }
  Notify.create({
    position: 'top',
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });
  showDeleteAllDialog.value = false;
}

function handleCancelAll() {
  showDeleteAllDialog.value = false;
}

function onDetailsClick(event: object) {
  showDetails.value = true;
  selectedEvent.value = event;
}

async function onClickMarkAsComplete(event: Partial<ItineraryEvent>) {
  event.isCompleted = !event.isCompleted;
  btnLoading.value = true;
  const response = await itineraryStore.editEventById(
    tripId.value!,
    itineraryStore.selectedDay!.id,
    event.id!,
    event,
  );
  btnLoading.value = false;

  Notify.create({
    position: 'top',
    type: 'info',
    message: event.isCompleted ? 'Event marked as complete' : 'Event mark as Incomplete',
    color: response.success ? 'info' : 'negative',
  });
}

async function onScheduleClick() {
  await router.push({
    path: '/itinerary/schedular',
    query: {
      tripId: tripId.value,
      tripName: tripStore.activeTrip?.name,
      date: itineraryStore.selectedDay!.id,
    },
  });
}

const showDeleteAllDialog = ref(false);
function onDeleteAll() {
  showDeleteAllDialog.value = true;
}

const onPreview = () => {
  const url = router.resolve({
    path: '/external/trip_day',
    query: {
      tripId: tripId.value,
      date: itineraryStore.selectedDay!.id,
    },
  }).href;
  window.open(url, '_blank');
};

const onClickIndividualorSchedule = async (val: object) => {
  console.log(val);
  const response = await itineraryStore.updateDayField(
    tripId.value!,
    itineraryStore.selectedDay!.id,
    val,
  );
  Notify.create({
    position: 'top',
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });
};
</script>

<style scoped></style>
