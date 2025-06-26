<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue';

type Meridiem = 'AM' | 'PM';

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = ['00', '15', '30', '45'];
const meridiems: Meridiem[] = ['AM', 'PM'];

// Props for v-model binding (time string) and label text
const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Internal refs for selects
const selectedHour = ref<string | null | undefined>(null);
const selectedMinute = ref<string | null | undefined>(null);
const selectedMeridiem = ref<Meridiem | null | undefined>(null);

// Sync from modelValue to selects when modelValue changes externally
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      selectedHour.value = null;
      selectedMinute.value = null;
      selectedMeridiem.value = null;
      return;
    }
    // Expecting format "hh:mm AM/PM"
    const match = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (match) {
      selectedHour.value = match[1];
      selectedMinute.value = match[2];
      selectedMeridiem.value = match[3]!.toUpperCase() as Meridiem;
    }
  },
  { immediate: true },
);

// When any select changes, emit updated value
watch([selectedHour, selectedMinute, selectedMeridiem], ([h, m, mer]) => {
  if (h && m && mer) {
    emit('update:modelValue', `${h.padStart(2, '0')}:${m} ${mer}`);
  } else {
    emit('update:modelValue', '');
  }
});
</script>

<template>
  <div class="row items-center q-gutter-sm">
    <!-- Label before selects -->
    <div v-if="props.label" class="text-subtitle2" style="min-width: 100px">
      {{ props.label }}
    </div>

    <q-select
      v-model="selectedHour"
      :options="hours"
      label="Hour"
      dense
      outlined
      style="width: 80px"
      emit-value
      map-options
    />
    <q-select
      v-model="selectedMinute"
      :options="minutes"
      label="Minute"
      dense
      outlined
      style="width: 80px"
      emit-value
      map-options
    />
    <q-select
      v-model="selectedMeridiem"
      :options="meridiems"
      label="AM/PM"
      dense
      outlined
      style="width: 80px"
      emit-value
      map-options
    />
  </div>
</template>
