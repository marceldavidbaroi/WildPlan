<template>
  <div class="q-gutter-xs q-col-gutter-sm row items-center">
    <!-- Label -->
    <div v-if="props.label" class="text-subtitle2 col-12 col-sm-auto" style="min-width: 100px">
      {{ props.label }}
    </div>

    <!-- Time Selects -->
    <div class="col-12 col-sm row q-gutter-xs">
      <q-select
        v-model="selectedHour"
        :options="hours"
        label="Hour"
        dense
        outlined
        emit-value
        map-options
        class="col-4"
      />
      <q-select
        v-model="selectedMinute"
        :options="minutes"
        label="Minute"
        dense
        outlined
        emit-value
        map-options
        class="col-4"
      />
      <q-select
        v-model="selectedMeridiem"
        :options="meridiems"
        label="AM/PM"
        dense
        outlined
        emit-value
        map-options
        class="col-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue';

type Meridiem = 'AM' | 'PM';

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = ['00', '15', '30', '45'];
const meridiems: Meridiem[] = ['AM', 'PM'];

const props = defineProps<{
  modelValue: string | undefined;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const selectedHour = ref<string | null | undefined>(null);
const selectedMinute = ref<string | null | undefined>(null);
const selectedMeridiem = ref<Meridiem | null | undefined>(null);

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      selectedHour.value = null;
      selectedMinute.value = null;
      selectedMeridiem.value = null;
      return;
    }

    const match = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (match) {
      selectedHour.value = match[1];
      selectedMinute.value = match[2];
      selectedMeridiem.value = match[3]!.toUpperCase() as Meridiem;
    }
  },
  { immediate: true },
);

watch([selectedHour, selectedMinute, selectedMeridiem], ([h, m, mer]) => {
  if (h && m && mer) {
    emit('update:modelValue', `${h.padStart(2, '0')}:${m} ${mer}`);
  } else {
    emit('update:modelValue', '');
  }
});
</script>
