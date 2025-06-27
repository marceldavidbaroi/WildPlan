<template>
  <q-page class="q-pa-md print-container bg-white text-black">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h2 class="text-h5 text-primary">Trip Plan for {{ formattedDate }}</h2>
        <p class="text-caption text-grey-7">Trip ID: {{ plan.tripId }}</p>
      </div>
      <q-btn label="Print" icon="print" color="primary" @click="printPage" />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <q-card-section>
        <div><strong>Daily Notes:</strong> {{ plan.dailyNotes || 'None' }}</div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-card-section>
        <div class="events-columns">
          <div v-for="(event, index) in plan.events" :key="index" class="event-section q-mb-md">
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
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
onMounted(() => {
  $q.dark.set(false);
});

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

const plan: Plan = {
  id: '2025-06-25',
  tripId: 'Wk2ibTylYn54KQFhlZ8z',
  date: '2025-06-25',
  dailyNotes: '',
  createdAt: 1750781475743,
  updatedAt: 1751017871091,
  events: [
    {
      startTime: '12:00 AM',
      endTime: '01:00 AM',
      assignedTo: ['John'],
      isCompleted: false,
      budgetImpact: { amount: 20, currency: 'USD' },
    },
    {
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      assignedTo: ['Alice'],
      notes: 'take a note of dreams',
      category: 'relaxation',
      address: 'hotel',
      createdAt: 1751017797968,
    },
  ],
};

const formattedDate = computed(() => {
  return new Date(plan.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

function printPage() {
  window.print();
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
}

.styled-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.status-checkbox {
  margin-left: 6px;
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
