<template>
  <div class="q-px-md flex justify-end">
    <q-btn flat color="primary" icon="add" @click="openDialog" />
  </div>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="q-pa-md" style="width: 100%; max-width: 700px">
      <q-card-section>
        <div class="text-h6 row items-center">
          <q-icon name="event" class="q-mr-sm" />
          Add Itinerary Event
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Column 1 -->
          <div class="col-12 col-md-6">
            <q-input v-model="form.name" label="Event Name" filled />
            <q-input v-model="form.locationName" label="Location Name" filled class="q-mt-sm" />
            <q-input v-model="form.address" label="Address" filled class="q-mt-sm" />
            <q-select
              v-model="form.category"
              :options="categories"
              label="Category"
              filled
              emit-value
              map-options
              class="q-mt-sm"
            />
          </div>

          <!-- Column 2 -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="form.description"
              label="Description"
              type="textarea"
              filled
              autogrow
            />

            <div class="q-mt-sm">
              <q-input v-model="form.startDate" label="Start Date" filled>
                <template #append>
                  <q-icon name="event" />
                </template>
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                  ref="startDatePopup"
                >
                  <q-date
                    v-model="form.startDate"
                    mask="YYYY-MM-DD"
                    :options="dateRangeOptions"
                    @update:model-value="onStartDateSelected"
                  />
                </q-popup-proxy>
              </q-input>
            </div>

            <div class="q-mt-sm">
              <q-input v-model="form.startTime" label="Start Time" filled>
                <template #append>
                  <q-icon name="schedule" />
                </template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="form.startTime" format24h />
                </q-popup-proxy>
              </q-input>
            </div>

            <div class="q-mt-sm">
              <q-input v-model="form.endTime" label="End Time" filled>
                <template #append>
                  <q-icon name="schedule" />
                </template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="form.endTime" format24h />
                </q-popup-proxy>
              </q-input>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn label="Add" color="primary" @click="addEvent" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NewItineraryEvent } from '../store/types';
import { ItineraryEventCategory } from '../store/types';
import { useItineraryStore } from '../store';
import type { QPopupProxy } from 'quasar';

const itineraryStore = useItineraryStore();
const props = defineProps<{
  tripId: string;
  startDate: string;
  endDate: string;
}>();

const showDialog = ref(false);

const categories = Object.values(ItineraryEventCategory).map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));

const form = ref(getEmptyForm());

function getEmptyForm() {
  return {
    name: '',
    description: '',
    startDate: '', // For q-date
    startTime: '', // For q-time
    endTime: '', // For q-time
    locationName: '',
    address: '',
    category: ItineraryEventCategory.Other,
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    icon: '',
    assignedTo: [],
    packingItemsNeeded: [],
    budgetImpact: {
      estimatedCost: 0,
    },
    notes: '',
  };
}

function openDialog() {
  form.value = getEmptyForm();
  showDialog.value = true;
}

async function addEvent() {
  const startTimestamp = `${form.value.startDate}T${form.value.startTime}`;

  const payload: NewItineraryEvent = {
    ...form.value,
    startTime: startTimestamp,
    ...(form.value.endTime && { endTime: `${form.value.startDate}T${form.value.endTime}` }),
  };

  // TODO: emit or save payload
  await itineraryStore.createItineraryEvent(props.tripId, form.value.startDate, payload);
  showDialog.value = false;
}

// ... other imports and code

// Convert YYYY/MM/DD string to Date object
function parseDate(dateStr: string) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  return new Date(year!, month! - 1, day);
}

const startDateLimit = computed(() => parseDate(props.startDate));
const endDateLimit = computed(() => parseDate(props.endDate));

// Function that disables dates outside the [startDateLimit, endDateLimit] range
function dateRangeOptions(date: string) {
  const d = new Date(date);
  if (!startDateLimit.value || !endDateLimit.value) return true; // allow all if limits missing
  return d >= startDateLimit.value && d <= endDateLimit.value;
}

const startDatePopup = ref<QPopupProxy | null>(null);

function onStartDateSelected() {
  // close the popup after selecting the date
  startDatePopup.value?.hide();
}
</script>

<style scoped></style>
