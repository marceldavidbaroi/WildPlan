<template>
  <q-page class="q-pa-none">
    <!-- Banner Section -->
    <div class="trip-banner">
      <q-img :src="trip?.photoURL || fallbackImage" :alt="trip?.name" class="banner-img">
        <div class="banner-overlay column justify-end">
          <div class="row justify-between items-center q-px-md q-pt-md">
            <div class="text-h5 text-bold text-white">{{ trip?.name }}</div>
            <div class="row">
              <q-btn-dropdown
                color="white"
                :label="selectedStatusLabel"
                text-color="primary"
                class=""
                size="sm"
              >
                <q-list>
                  <q-item
                    v-for="status in statusOptions"
                    :key="status.value"
                    clickable
                    v-close-popup
                    @click="selectStatus(status.value)"
                  >
                    <q-item-section>{{ status.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn flat round icon="archive" color="white" @click="onArchive()" />
              <q-btn flat round icon="settings" color="white" @click="openSettings()" />
            </div>
          </div>
          <div class="q-px-md q-pb-md row items-center text-white text-caption">
            <q-icon name="place" size="16px" class="q-mr-xs" />
            {{ trip?.location.name }}
          </div>
        </div>
      </q-img>
    </div>

    <!-- Details Section -->
    <div class="trip-details q-pa-md">
      <q-separator />

      <div class="details-grid q-mt-md">
        <!-- Dates & Status -->
        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="event" />
          <div>
            <div class="text-subtitle2 text-bold">Trip Dates</div>
            <div class="text-caption">
              {{ formatDate(trip?.startDate) }} → {{ formatDate(trip?.endDate) }}
            </div>
          </div>
        </div>

        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="info" />
          <div>
            <div class="text-subtitle2 text-bold">Status</div>
            <q-chip square dense :color="getStatusColor(trip?.status)" text-color="white">
              {{ trip?.status }}
            </q-chip>
          </div>
        </div>

        <!-- People -->
        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="group" />
          <div>
            <div class="text-subtitle2 text-bold">Members</div>
            <div class="text-caption">{{ trip?.members.length }} participant(s)</div>
          </div>
        </div>

        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="person" />
          <div>
            <div class="text-subtitle2 text-bold">Created By</div>
            <div class="text-caption">{{ trip?.createdBy }}</div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="code" />
          <div>
            <div class="text-subtitle2 text-bold">Invite Code</div>
            <div class="text-caption">{{ trip?.inviteCode }}</div>
          </div>
        </div>

        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="history" />
          <div>
            <div class="text-subtitle2 text-bold">Created</div>
            <div class="text-caption">{{ formatDateTime(trip?.createdAt) }}</div>
          </div>
        </div>

        <div class="detail-item row items-center q-gutter-md">
          <q-icon name="update" />
          <div>
            <div class="text-subtitle2 text-bold">Last Updated</div>
            <div class="text-caption">{{ formatDateTime(trip?.updatedAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useTripStore } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { date } from 'quasar';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();

const fallbackImage = 'https://cdn.quasar.dev/img/parallax2.jpg';

const id = ref();
onMounted(async () => {
  const rawId = route.params.id;
  id.value = Array.isArray(rawId) ? rawId[0] : rawId;

  if (typeof id.value !== 'string') {
    router.replace('/not-found');
    return;
  }

  await tripStore.fetchTrip(id.value);

  console.log(tripStore.activeTrip);
});

const trip = computed(() => tripStore.activeTrip);

function formatDate(input?: string | number): string {
  return input ? date.formatDate(new Date(input), 'MMM D, YYYY') : '';
}

function formatDateTime(input?: number): string {
  return input ? date.formatDate(new Date(input), 'MMM D, YYYY – h:mm A') : '';
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'upcoming':
      return 'primary';
    case 'completed':
      return 'positive';
    case 'cancelled':
      return 'negative';
    default:
      return 'grey';
  }
}

function openSettings() {
  router.push({ path: `/trip/settings/${id.value}` });
}

const selectedStatus = ref<'upcoming' | 'completed' | 'cancelled'>('upcoming');

const statusOptions: { label: string; value: 'upcoming' | 'completed' | 'cancelled' }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const selectedStatusLabel = computed(() => {
  return statusOptions.find((opt) => opt.value === selectedStatus.value)?.label || '';
});

function selectStatus(status: 'upcoming' | 'completed' | 'cancelled') {
  selectedStatus.value = status;
}
</script>

<style scoped>
.trip-banner {
  position: relative;
  height: 260px;
  width: 100%;
  overflow: hidden;
}

.banner-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.banner-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0));
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  padding-top: 60px;
}

.trip-details {
  max-width: 700px;
  margin: 0 auto;
}

/* Two-column grid for large screens */
.details-grid {
  display: grid;
  gap: 1.2rem 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-item {
  align-items: center;
}

.text-subtitle2 {
  font-size: 1rem;
}
</style>
