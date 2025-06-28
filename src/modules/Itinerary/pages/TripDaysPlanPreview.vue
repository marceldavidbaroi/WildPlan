<template>
  <q-page class="print-preview q-pa-md">
    <!-- Print Button -->
    <div class="q-mb-md no-print">
      <q-btn label="Print Trip Plan" icon="print" color="primary" @click="printPage" />
    </div>

    <!-- Trip Preview Content -->
    <div class="trip-container" v-if="data && data.length">
      <div v-for="(day, index) in data" :key="day.id" class="day-section q-mb-xl">
        <h2 class="day-title">Day {{ index + 1 }} – {{ formatDate(day.date) }}</h2>

        <!-- Notes -->
        <div v-if="day.dailyNotes" class="q-mb-md">
          <strong>Notes:</strong>
          <p>{{ day.dailyNotes }}</p>
        </div>

        <!-- Events -->
        <div v-if="day.events && day.events.length" class="events-grid">
          <div v-for="(event, eIndex) in day.events" :key="event.id || eIndex" class="event-block">
            <p class="event-title">📌 {{ event.name || 'Untitled Event' }}</p>
            <p class="event-time">🕒 {{ event.startTime }} - {{ event.endTime }}</p>
            <p v-if="event.locationName && event.locationName.trim()">
              📍 Location: {{ event.locationName }}
            </p>
            <p v-if="event.description && event.description.trim()">📝 {{ event.description }}</p>
            <p v-if="event.notes && event.notes.trim()">🗒️ Notes: {{ event.notes }}</p>
            <p v-if="event.budgetImpact?.estimatedCost > 0">
              💰 Estimated Cost: {{ event.budgetImpact.estimatedCost }} BDT
            </p>
            <p v-if="event.assignedTo && event.assignedTo.length">
              👥 Assigned To:
              <span v-for="(uid, i) in event.assignedTo" :key="uid">
                {{ findUser(uid)?.displayName || 'Unknown'
                }}<span v-if="i < event.assignedTo.length - 1">, </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-pa-md">No trip data found.</div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useItineraryStore } from '../store';
import { useRoute } from 'vue-router';
import { useAuthStore } from 'src/modules/auth/store';

const itineraryStore = useItineraryStore();
const authStore = useAuthStore();
const route = useRoute();
const tripId = ref<string>();
const data = ref<any[]>([]);

onMounted(async () => {
  tripId.value = route.query.tripId as string;
  const response = await itineraryStore.getAllDays(tripId.value);
  await authStore.fetchAllUser();
  data.value = response.data ?? [];
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const printPage = () => {
  window.print();
};

const findUser = (id: string) => {
  return authStore.allUsers?.find((u) => u.uid === id);
};
</script>

<style scoped>
.print-preview {
  background-color: #fff;
  font-family: 'Georgia', serif;
  color: #333;
  max-width: 800px;
  margin: auto;
  padding: 2rem;
}

/* Hide the print button during printing */
@media print {
  .no-print {
    display: none !important;
  }

  .print-preview {
    box-shadow: none;
    padding: 0;
  }
}

.day-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.25rem;
}

.events-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.event-block {
  flex: 1 1 calc(50% - 1rem);
  background-color: #f7f7f7;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  page-break-inside: avoid;
}

.event-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.event-time {
  font-size: 0.9rem;
  color: #555;
}
</style>
