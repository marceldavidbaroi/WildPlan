<template>
  <q-dialog v-model="isOpen">
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEdit ? 'Edit Task' : 'New Task' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="form.title"
          label="Title"
          filled
          dense
          autofocus
          required
          hide-bottom-space
          :rules="[(val) => !!val || 'Title is required']"
        />

        <q-input
          v-model="form.description"
          label="Description"
          filled
          type="textarea"
          dense
          class="q-mt-md"
        />

        <q-input v-model="form.dueDate" label="Due Date" filled dense readonly class="q-mt-md">
          <template #append>
            <q-icon name="event" class="cursor-pointer" @click="showDatePicker = true" />
          </template>

          <q-popup-proxy v-model="showDatePicker" transition-show="scale" transition-hide="scale">
            <q-date
              v-model="form.dueDate"
              @update:model-value="closeDatePicker"
              mask="YYYY-MM-DD"
            />
          </q-popup-proxy>
        </q-input>
        <!-- <q-select
          v-model="form.priority"
          label="Priority"
          :options="['Low', 'Medium', 'High']"
          filled
          dense
          class="q-mt-md"
        /> -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" flat color="grey" @click="close" />
        <q-btn label="Save" color="primary" @click="save" :disable="!form.title" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue';
import type { Task } from '../store/types';

const props = defineProps<{
  modelValue: boolean; // for v-model
  isEdit?: boolean; // explicit
  task?: Task; // optional task to edit
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', value: Task): void;
}>();

const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;

    // Reset form when dialog opens
    if (val) {
      initializeForm();
    }
  },
);

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

function getToday(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const form = ref<Task>({
  tripId: '',
  title: '',
  description: '',
  assignedTo: [],
  dueDate: '',
  priority: undefined,
});

// Setup form values
function initializeForm() {
  if (props.isEdit && props.task) {
    form.value = { ...props.task };
  } else {
    form.value = {
      tripId: '',
      title: '',
      description: '',
      assignedTo: [],
      dueDate: getToday(),
      priority: undefined,
    };
  }
}

function save() {
  emit('save', { ...form.value });
  close();
}

function close() {
  isOpen.value = false;
}

const showDatePicker = ref(false);

function closeDatePicker() {
  showDatePicker.value = false;
}

// Initialize once on mount if open
if (isOpen.value) {
  initializeForm();
}
</script>

<style scoped></style>
