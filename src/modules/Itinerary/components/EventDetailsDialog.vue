<template>
  <q-dialog v-model="show" persistent>
    <q-card class="q-pa-md" style="min-width: 360px; max-width: 650px">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-h6 text-primary">
          <q-icon name="event" class="q-mr-sm" />
          Event Details
        </div>
        <q-btn icon="close" flat round dense color="primary" v-close-popup />
      </q-card-section>

      <q-separator class="q-my-sm" />

      <q-card-section class="q-gutter-y-sm">
        <div class="row items-center">
          <q-icon name="badge" class="q-mr-sm text-grey" />
          <div><strong>Name:</strong> {{ props.event.name }}</div>
        </div>

        <div class="row items-center">
          <q-icon name="description" class="q-mr-sm text-grey" />
          <div><strong>Description:</strong> {{ props.event.description }}</div>
        </div>

        <div class="row items-center">
          <q-icon name="schedule" class="q-mr-sm text-grey" />
          <div>
            <strong>Start:</strong> {{ formatTime(props.event.startTime) }} &nbsp;|&nbsp;
            <strong>End:</strong> {{ formatTime(props.event.endTime) }}
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="place" class="q-mr-sm text-grey" />
          <div>
            <strong>Location:</strong> {{ props.event.locationName }} ({{ props.event.address }})
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="location_on" class="q-mr-sm text-grey" />
          <div>
            <strong>Coordinates:</strong>
            <MapPicker
              :initial-location="props.event.coordinates"
              :isSetLocation="false"
              btnLabel="Show Location"
            />
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="category" class="q-mr-sm text-grey" />
          <div>
            <strong>Category:</strong>
            <q-badge color="secondary" class="q-ml-sm">{{ props.event.category }}</q-badge>
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="group" class="q-mr-sm text-grey" />
          <div>
            <strong>Assigned To:</strong>
            <q-chip
              v-for="user in props.event.assignedTo"
              :key="user"
              dense
              color="primary"
              text-color="white"
              class="q-ml-xs"
            >
              {{ findUser(user) }}
            </q-chip>
            <span v-if="!props.event.assignedTo?.length">N/A</span>
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="inventory_2" class="q-mr-sm text-grey" />
          <div>
            <strong>Packing Items:</strong>
            <q-chip
              v-for="item in props.event.packingItemsNeeded"
              :key="item"
              dense
              color="orange"
              text-color="white"
              class="q-ml-xs"
            >
              {{ item }}
            </q-chip>
            <span v-if="!props.event.packingItemsNeeded?.length">None</span>
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="attach_money" class="q-mr-sm text-grey" />
          <div><strong>Estimated Cost:</strong> ${{ props.event.budgetImpact.estimatedCost }}</div>
        </div>

        <div class="row items-center">
          <q-icon name="sticky_note_2" class="q-mr-sm text-grey" />
          <div><strong>Notes:</strong> {{ props.event.notes }}</div>
        </div>

        <div class="row items-center">
          <q-icon name="task_alt" class="q-mr-sm text-grey" />
          <div>
            <strong>Status:</strong>
            <q-badge :color="props.event.isCompleted ? 'green' : 'red'" class="q-ml-sm">
              {{ props.event.isCompleted ? 'Completed' : 'Not Completed' }}
            </q-badge>
          </div>
        </div>

        <div class="row items-center">
          <q-icon name="event_available" class="q-mr-sm text-grey" />
          <div><strong>Created:</strong> {{ formatDate(props.event.createdAt) }}</div>
        </div>

        <div class="row items-center">
          <q-icon name="update" class="q-mr-sm text-grey" />
          <div><strong>Updated:</strong> {{ formatDate(props.event.updatedAt) }}</div>
        </div>
      </q-card-section>

      <q-separator class="q-mt-sm" />

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/modules/auth/store';
import MapPicker from 'src/components/MapPicker.vue';
import { ref, watch } from 'vue';
const authStore = useAuthStore();

const props = defineProps({
  modelValue: Boolean,
  event: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);
const show = ref(props.modelValue);

// Watch prop -> local
watch(
  () => props.modelValue,
  (val) => {
    show.value = val;
  },
);

// Watch local -> emit
watch(show, (val) => {
  emit('update:modelValue', val);
});

// Format timestamps (milliseconds to readable date)
function formatDate(ts: number): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleString();
}

// Format time (handle both 12h and ISO formats)
function formatTime(val: string): string {
  if (!val) return 'N/A';
  const parsed = Date.parse(val);
  return isNaN(parsed)
    ? val
    : new Date(parsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function findUser(id: string) {
  return authStore.allUsers?.find((u) => (u.uid = id))?.displayName;
}
</script>

<style scoped></style>
