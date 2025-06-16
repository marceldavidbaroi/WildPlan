<template>
  <div class="q-pa-md">
    <q-scroll-area class="scroll-container no-scrollbar">
      <div class="row no-wrap q-gutter-md scroll-row">
        <q-card
          v-for="card in cards"
          :key="card.id"
          class="swap-card"
          flat
          bordered
          :style="{ backgroundImage: `url(${card.photoURL || defaultImage})` }"
        >
          <div class="overlay" />
          <q-card-section class="card-text">
            <div class="text-h6">{{ card.name }}</div>
            <div class="text-subtitle2">{{ card.location?.name || card.status }}</div>
            <div class="text-caption">{{ formatDateRange(card.startDate, card.endDate) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
    <div class="row justify-end">all...</div>
  </div>
</template>

<script setup lang="ts">
import type { Trip } from 'src/modules/trip/store/types';
defineProps<{
  cards: Array<Trip>;
}>();

const defaultImage = 'https://via.placeholder.com/220x280?text=No+Image';

function formatDateRange(start: string, end: string) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as const;
  const startDate = new Date(start).toLocaleDateString(undefined, options);
  const endDate = new Date(end).toLocaleDateString(undefined, options);
  return `${startDate} - ${endDate}`;
}
</script>

<style scoped>
.scroll-container {
  height: 280px;
  max-width: 100%;
  overflow-x: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scroll-container ::-webkit-scrollbar {
  display: none;
}

.scroll-container .q-scrollarea__bar {
  display: none !important;
}

.scroll-row {
  width: max-content;
}

.swap-card {
  position: relative;
  min-width: 220px;
  max-width: 220px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  background-size: cover;
  background-position: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.swap-card:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  z-index: 1;
}

.card-text {
  position: relative;
  z-index: 2;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}
</style>
