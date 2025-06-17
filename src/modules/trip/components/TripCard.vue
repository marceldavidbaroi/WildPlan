<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm q-row-gutter-sm">
      <div v-for="trip in trips" :key="trip.id" class="col-12 col-sm-6 col-md-3">
        <q-card class="trip-card" flat bordered @click="onCardClick(trip.id)">
          <div class="card-image">
            <img :src="trip.photoURL || fallbackImage" alt="Trip Cover" />
            <div class="info-overlay">
              <div class="title">{{ trip.name }}</div>
              <div class="location text-caption text-grey-3">
                {{ trip.location.name }}
              </div>
              <div class="chips q-gutter-xs q-mt-xs">
                <q-chip dense square color="primary" text-color="white">
                  {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
                </q-chip>
                <q-chip dense square color="secondary" text-color="white">
                  {{ trip.members.length }} Members
                </q-chip>
                <q-chip dense square :color="getStatusColor(trip.status)" text-color="white">
                  {{ trip.status }}
                </q-chip>
              </div>
              <div class="creator text-caption text-grey-4 q-mt-xs">by {{ trip.createdBy }}</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import type { Trip } from '../store/types';
import { useRouter } from 'vue-router';
const router = useRouter();

defineProps<{
  trips: Trip[];
}>();

const fallbackImage = 'https://cdn.quasar.dev/img/parallax2.jpg';

function formatDate(input: string | number): string {
  return date.formatDate(new Date(input), 'MMM D');
}

function getStatusColor(status: Trip['status']) {
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

const onCardClick = async (id: string) => {
  await router.push({ path: `/trip/${id}` });
};
</script>

<style scoped>
.trip-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.15s ease;
  height: 230px;
  position: relative;
}

.trip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.1);
}

.card-image {
  height: 100%;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  color: white;
}

.title {
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.2;
}

.q-chip {
  font-size: 0.65rem;
  padding: 2px 4px;
  height: auto;
}

.creator {
  font-size: 0.65rem;
}
</style>
