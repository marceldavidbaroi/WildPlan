<template>
  <q-page class="q-pa-md bg-page">
    <!-- Sticky Toolbar -->
    <div class="toolbar row q-gutter-sm items-center">
      <div class="col-12 text-bold">
        <q-btn
          color="warning"
          flat
          dense
          icon="arrow_back"
          @click="router.push({ path: `/itinerary/${tripId}/day/${date}` })"
        />
        <div class="text-h6">{{ tripName }}</div>
        <div class="text-caption">{{ date }}</div>
      </div>
      <div class="row justify-between">
        <q-btn
          label="Add Event"
          color="primary"
          unelevated
          class="q-px-md q-mr-sm"
          :disable="selectedBlocks.length === 0"
          @click="showDialog = true"
        />
        <q-btn
          label="Delete All"
          color="negative"
          unelevated
          class="q-px-md"
          :disable="events.length === 0"
          @click="deleteAllEvent"
        />
      </div>
    </div>

    <!-- Scrollable Time Grid -->
    <div class="scroll-area q-mt-md" :class="isDarkMode ? 'text-white' : 'text-black'">
      <div v-if="!loading" class="row q-col-gutter-md">
        <!-- AM -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-sm">
            <div class="text-subtitle2 q-mb-sm">AM</div>
            <div v-for="hour in 12" :key="'am-' + hour" class="q-mb-xs">
              <div class="row items-center">
                <div class="col-2 text-center text-caption text-bold">{{ hour }} AM</div>
                <div class="col-10 row q-col-gutter-xs">
                  <div
                    v-for="quarter in 4"
                    :key="'am-' + hour + '-' + quarter"
                    class="col-3 interval-box"
                    :class="{
                      selected: isSelected('am', hour - 1, quarter - 1),
                      hasEvent: hasEvent('am', hour - 1, quarter - 1),
                    }"
                    :style="getBlockStyle('am', hour - 1, quarter - 1)"
                    @click="toggleSelection('am', hour - 1, quarter - 1)"
                  >
                    <span class="event-label"
                      ><q-icon
                        v-if="getBlockEventName('am', hour - 1, quarter - 1)"
                        :name="getCategoryIcon(getBlockEventType('am', hour - 1, quarter - 1))"
                        size="sm"
                      />{{ getBlockEventName('am', hour - 1, quarter - 1) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- PM -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-sm">
            <div class="text-subtitle2 q-mb-sm">PM</div>
            <div v-for="hour in 12" :key="'pm-' + hour" class="q-mb-xs">
              <div class="row items-center">
                <div class="col-2 text-center text-caption text-bold">{{ hour }} PM</div>
                <div class="col-10 row q-col-gutter-xs">
                  <div
                    v-for="quarter in 4"
                    :key="'pm-' + hour + '-' + quarter"
                    class="col-3 interval-box"
                    :class="{
                      selected: isSelected('pm', hour - 1, quarter - 1),
                      hasEvent: hasEvent('pm', hour - 1, quarter - 1),
                    }"
                    :style="getBlockStyle('pm', hour - 1, quarter - 1)"
                    @click="toggleSelection('pm', hour - 1, quarter - 1)"
                  >
                    <span class="event-label">
                      <q-icon
                        v-if="getBlockEventName('pm', hour - 1, quarter - 1)"
                        :name="getCategoryIcon(getBlockEventType('pm', hour - 1, quarter - 1))"
                        size="sm"
                      />
                      {{ getBlockEventName('pm', hour - 1, quarter - 1) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
      <div v-else class="flex flex-center">
        <q-spinner-ball size="md" color="primary" />
      </div>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Edit Event' : 'Add Event' }}</div>
          <q-input v-model="eventName" label="Event Name" autofocus />
          <q-select v-model="eventType" :options="eventTypeOption" label="Standard" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelEvent" />
          <q-btn flat label="Save" :loading="btnLoading" @click="saveEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { ref, reactive, onMounted } from 'vue';
import { Notify, useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { ItineraryEventCategory } from '../store/types';
import { useItineraryStore } from '../store';
import type { NewItineraryEvent, ItineraryEvent } from '../store/types';
import DeleteDialog from 'src/components/DeleteDialog.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const itineraryStore = useItineraryStore();

const isDarkMode = ref<boolean>(false);
const tripId = ref();
const date = ref();
const tripName = ref();
const selectedEvent = ref();
const btnLoading = ref(false);
const loading = ref(false);
const showDeleteAllDialog = ref(false);

onMounted(async () => {
  loading.value = true;
  isDarkMode.value = $q.dark.isActive;
  tripId.value = route.query.tripId;
  date.value = route.query.date;
  tripName.value = route.query.tripName;
  const response = await itineraryStore.getDay(tripId.value, date.value);
  events.value = response.data?.events ?? [];
  loading.value = false;
});

type Period = 'am' | 'pm';
interface BlockKey {
  period: Period;
  hour: number;
  quarter: number;
}
interface ScheduledEvent {
  name: string;
  startTime: string;
  endTime: string;
  category: string;
}

const selectedBlocks = ref<BlockKey[]>([]);
const eventName = ref('');
const eventType = ref('');
const eventTypeOption = Object.values(ItineraryEventCategory);
const showDialog = ref(false);
const events = ref<Partial<ItineraryEvent>[]>([]);
const isEditMode = ref(false);
const editingEventIndex = ref<number | null>(null);

const defaultEvent: NewItineraryEvent = {
  id: '',
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  locationName: '',
  address: '',
  coordinates: {
    lat: 0,
    lng: 0,
  },
  category: '',
  assignedTo: [],
  isCompleted: false,
  packingItemsNeeded: [],
  budgetImpact: {
    estimatedCost: 0,
  },
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function deepMergeDefaults(target: any, defaults: any): any {
  if (Array.isArray(defaults)) return target ?? [];
  if (typeof defaults === 'object' && defaults !== null) {
    const merged: any = {};
    for (const key in defaults) {
      merged[key] = deepMergeDefaults(target?.[key], defaults[key]);
    }
    return merged;
  }
  return target ?? defaults;
}

const getEventBlocks = (event: NewItineraryEvent): BlockKey[] => {
  const blocks: BlockKey[] = [];

  for (const period of ['am', 'pm'] as Period[]) {
    for (let hour = 0; hour < 12; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const block = { period, hour, quarter };
        const timeStr = blockToTimeString(block);
        if (isTimeInRange(timeStr, event.startTime, event.endTime)) {
          blocks.push(block);
        }
      }
    }
  }

  return blocks;
};

const toggleSelection = (period: Period, hour: number, quarter: number) => {
  const time = blockToTimeString({ period, hour, quarter });
  const eventIndex = events.value.findIndex((e) => isTimeInRange(time, e.startTime, e.endTime));

  if (eventIndex !== -1) {
    // Prefill dialog with existing event
    const event = events.value[eventIndex];
    selectedEvent.value = event;
    eventName.value = event.name;
    eventType.value = event.category;
    isEditMode.value = true;
    editingEventIndex.value = eventIndex;
    selectedBlocks.value = getEventBlocks(event); // helper function below
    showDialog.value = true;
    return;
  }

  // Normal toggle behavior
  const index = selectedBlocks.value.findIndex(
    (b) => b.period === period && b.hour === hour && b.quarter === quarter,
  );
  if (index >= 0) {
    selectedBlocks.value.splice(index, 1);
  } else {
    selectedBlocks.value.push({ period, hour, quarter });
  }
};

const cancelEvent = () => {
  showDialog.value = false;
  eventName.value = '';
  eventType.value = '';
  selectedBlocks.value = [];
  isEditMode.value = false;
  editingEventIndex.value = null;
};

const saveEvent = async () => {
  btnLoading.value = true;
  if (!eventName.value.trim()) return;

  const sorted = [...selectedBlocks.value].sort(compareBlock);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const updatedEvent: NewItineraryEvent = {
    name: eventName.value,
    startTime: blockToTimeString(first),
    endTime: blockToTimeString(last, true),
    category: eventType.value,
  };
  const EditEvent: ItineraryEvent = {
    ...selectedEvent.value,
    name: eventName.value,
    startTime: blockToTimeString(first),
    endTime: blockToTimeString(last, true),
    category: eventType.value,
  };

  if (isEditMode.value && editingEventIndex.value !== null) {
    const safeEvent = deepMergeDefaults(EditEvent, defaultEvent);

    const responseq = await itineraryStore.editEventById(
      tripId.value,
      date.value,
      EditEvent.id,
      safeEvent,
    );
    const response = await itineraryStore.getDay(tripId.value, date.value);
    events.value = response.data?.events ?? [];
  } else {
    events.value.push(updatedEvent);
    const safeEvent = deepMergeDefaults(updatedEvent, defaultEvent);

    await itineraryStore.addEvent(tripId.value, date.value, safeEvent);
    const response = await itineraryStore.getDay(tripId.value, date.value);
    events.value = response.data?.events ?? [];
  }

  // Reset form
  selectedBlocks.value = [];
  eventName.value = '';
  eventType.value = '';
  isEditMode.value = false;
  editingEventIndex.value = null;
  showDialog.value = false;

  btnLoading.value = false;
};

// const exportEvents = async () => {
//   for (const event of events) {
//     await itineraryStore.addEvent(tripId.value, date.value, event);
//   }
// };

const isSelected = (p: Period, h: number, q: number) =>
  selectedBlocks.value.some((b) => b.period === p && b.hour === h && b.quarter === q);

const hasEvent = (p: Period, h: number, q: number) => !!getBlockEventName(p, h, q);

const getBlockEventName = (p: Period, h: number, q: number) => {
  const time = blockToTimeString({ period: p, hour: h, quarter: q });
  return events.value.find((e) => isTimeInRange(time, e.startTime, e.endTime))?.name ?? '';
};
const getBlockEventType = (p: Period, h: number, q: number) => {
  const time = blockToTimeString({ period: p, hour: h, quarter: q });
  return events.value.find((e) => isTimeInRange(time, e.startTime, e.endTime))?.category ?? '';
};

const blockToTimeString = (block: BlockKey, isEnd = false): string => {
  let hour = block.hour === 0 ? 12 : block.hour;
  let minute = block.quarter * 15;
  let suffix = block.period.toUpperCase();

  if (isEnd) {
    minute += 15;
    if (minute === 60) {
      minute = 0;
      hour += 1;
      if (hour === 12) suffix = suffix === 'AM' ? 'PM' : 'AM';
      else if (hour > 12) hour = 1;
    }
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${suffix}`;
};

const parseTime = (t: string): number => {
  const [hhmm, suffix] = t.split(' ');
  let [h, m] = hhmm.split(':').map(Number);
  if (suffix === 'PM' && h !== 12) h += 12;
  if (suffix === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const isTimeInRange = (time: string, start: string, end: string): boolean => {
  const t = parseTime(time);
  return t >= parseTime(start) && t < parseTime(end);
};

const compareBlock = (a: BlockKey, b: BlockKey) => {
  const periodWeight = { am: 0, pm: 1 };
  return (
    periodWeight[a.period] * 1000 +
    a.hour * 4 +
    a.quarter -
    (periodWeight[b.period] * 1000 + b.hour * 4 + b.quarter)
  );
};

// 🔵 Unique Soft Color Per Event
const lightEventColors = [
  '#dceefb',
  '#ffe8cc',
  '#e0f7fa',
  '#f3e5f5',
  '#dcedc8',
  '#fff9c4',
  '#fce4ec',
  '#e1f5fe',
  '#ede7f6',
  '#f1f8e9',
];
const darkModeEventColors = [
  '#3a6ea5', // darker blue (from #dceefb)
  '#b37429', // richer orange (from #ffe8cc)
  '#007c91', // deeper teal (from #e0f7fa)
  '#7b4397', // deeper purple (from #f3e5f5)
  '#5a7d1f', // darker green (from #dcedc8)
  '#b2a52f', // muted yellow (from #fff9c4)
  '#9c385a', // richer pink (from #fce4ec)
  '#0277bd', // deeper light blue (from #e1f5fe)
  '#5c49a1', // richer lavender (from #ede7f6)
  '#607d35', // deeper lime green (from #f1f8e9)
];

const getBlockStyle = (p: Period, h: number, q: number) => {
  const time = blockToTimeString({ period: p, hour: h, quarter: q });
  const eventIndex = events.value.findIndex((e) => isTimeInRange(time, e.startTime, e.endTime));
  if (eventIndex !== -1) {
    let eventColors = null;
    if (isDarkMode.value) {
      eventColors = darkModeEventColors;
    } else {
      eventColors = lightEventColors;
    }
    return {
      backgroundColor: eventColors[eventIndex % eventColors.length],
      border: '1px solid #ccc',
    };
  }
  return {};
};

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

const deleteAllEvent = () => {
  showDeleteAllDialog.value = true;
};

async function handleConfirmAll() {
  const response = await itineraryStore.deleteAllEvents(tripId.value, date.value);

  if (response?.success) {
    const response = await itineraryStore.getDay(tripId.value, date.value);
    events.value = response.data?.events ?? [];
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
</script>

<style scoped>
.scroll-area {
  max-height: 75vh;
  overflow-y: auto;
}
.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
}

.interval-box {
  height: 40px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--q-bg);
  transition: all 0.2s;
}
.interval-box:hover {
  opacity: 0.85;
}
.interval-box.selected {
  border: 2px dashed #42a5f5;
  background-color: rgba(66, 165, 245, 0.15);
}
.event-label {
  font-size: 0.65rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
