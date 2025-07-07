<template>
  <q-page class="q-pa-md print-container bg-white text-black">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h2 class="text-h5 text-primary">Trip Plan for {{ formattedDate }}</h2>
        <p class="text-caption text-primary">
          Trip name: {{ tripStore.activeTrip?.name || 'Loading...' }}
        </p>
      </div>
      <q-btn class="no-print" label="Print" icon="print" color="primary" @click="printPage" />
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="flex flex-center q-my-xl">
      <q-spinner-ball size="50px" color="primary" />
    </div>

    <!-- Main content only shows when NOT loading -->
    <div v-else>
      <q-card flat bordered class="q-pa-md q-mb-md">
        <q-card-section>
          <div><strong>Daily Notes:</strong> {{ events?.dailyNotes || 'None' }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="events-columns">
            <div
              v-for="(event, index) in events?.events || []"
              :key="index"
              class="event-section q-mb-md"
            >
              <div class="event-header q-pa-xs">
                <input
                  type="checkbox"
                  :checked="event.isCompleted"
                  disabled
                  class="status-checkbox"
                  title="Completed status"
                  style="margin-right: 10px; vertical-align: middle"
                />
                Event {{ index + 1 }}
              </div>
              <ul class="styled-list">
                <li><strong>Time:</strong> {{ event.startTime }} - {{ event.endTime }}</li>
                <li><strong>Assigned To:</strong> {{ event.assignedTo.join(', ') }}</li>
                <li v-if="event.category"><strong>Category:</strong> {{ event.category }}</li>
                <li v-if="event.address"><strong>Address:</strong> {{ event.address }}</li>
                <li v-if="event.notes"><strong>Notes:</strong> {{ event.notes }}</li>
                <li v-if="event.budgetImpact">
                  <strong>Budget:</strong> +{{ event.budgetImpact.amount }}
                  {{ event.budgetImpact.currency }}
                </li>
              </ul>
            </div>
            <div v-if="!events?.events || events.events.length === 0" class="text-grey-6">
              No events available.
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useItineraryStore } from '../store';
import { useRoute } from 'vue-router';
import { useTripStore } from 'src/modules/trip/store';
const tripStore = useTripStore();

interface BudgetImpact {
  amount: number;
  currency: string;
}

interface Event {
  startTime: string;
  endTime: string;
  assignedTo: string[];
  notes?: string;
  category?: string;
  address?: string;
  isCompleted?: boolean;
  budgetImpact?: BudgetImpact;
}

interface Plan {
  id: string;
  tripId: string;
  date: string;
  dailyNotes: string;
  events: Event[];
  createdAt: number;
  updatedAt: number;
}

const route = useRoute();
const itineraryStore = useItineraryStore();
const $q = useQuasar();

const events = ref<Plan | null>(null);
const tripId = ref<string | null>(null);
const date = ref<string | null>(null);
const loading = ref(true); // <-- loading state

onMounted(async () => {
  $q.dark.set(false);
  tripId.value = route.query.tripId as string;
  date.value = route.query.date as string;

  if (tripId.value && date.value) {
    loading.value = true;
    try {
      const response = await itineraryStore.getDay(tripId.value, date.value);
      events.value = response.data;
      await getTripDetails(response.data?.tripId ?? '');
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

const formattedDate = computed(() => {
  if (!events.value?.date) return '';
  return new Date(events.value.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

function printPage() {
  window.print();
}
async function getTripDetails(tripId: string) {
  await tripStore.fetchTrip(tripId);
}
</script>

<style scoped>
.print-container {
  max-width: 800px;
  margin: auto;
  background: white;
  color: #000;
}

.event-header {
  background-color: #f5f7fa; /* subtle light gray-blue */
  color: #34495e;
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.styled-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.status-checkbox {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  cursor: default;
}

.styled-list li {
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.4;
}

/* PRINT STYLES */
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 10mm 15mm 10mm;
  }

  html,
  body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    font-size: 12px;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
    print-color-adjust: exact;
  }

  .q-btn,
  .text-caption {
    display: none !important;
  }

  .q-page {
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }

  .print-container {
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .q-card,
  .q-card-section {
    box-shadow: none !important;
    background: white !important;
    page-break-inside: avoid;
  }

  .styled-list li {
    font-size: 12px !important;
  }

  .event-header {
    background-color: #f5f7fa !important;
    color: #34495e !important;
  }

  /* Two column layout for events */
  .events-columns {
    column-count: 2;
    column-gap: 20px;
    break-inside: avoid;
  }

  .event-section {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 12px;
  }
}
</style>
