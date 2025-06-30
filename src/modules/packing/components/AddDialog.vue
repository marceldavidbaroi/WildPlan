<template>
  <q-dialog
    v-model="internalVisible"
    persistent
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ props.isEdit ? 'Edit Packing Item' : 'Add Packing Item' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="handleClose" />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-input v-model="form.name" label="Item Name" outlined dense autofocus required />

          <q-input
            v-model.number="form.quantity"
            label="Quantity"
            type="number"
            min="1"
            outlined
            dense
            required
          />

          <q-select
            v-model="form.category"
            label="Category"
            :options="categories"
            emit-value
            map-options
            outlined
            dense
            required
          />

          <q-select
            v-model="form.type"
            label="Type"
            :options="types"
            emit-value
            map-options
            outlined
            dense
            required
          />

          <q-toggle v-model="form.isPacked" label="Packed?" left-label color="primary" />

          <q-input v-model="form.dueDate" label="Due Date" outlined dense readonly>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="form.dueDate"
                    mask="YYYY-MM-DD"
                    today-btn
                    default-view="Calendar"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="form.notes" label="Notes" type="textarea" autogrow outlined dense />

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Cancel" flat @click="handleClose" />
            <q-btn
              :label="props.isEdit ? 'Update' : 'Add'"
              color="primary"
              :loading="props.loading"
              type="submit"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PackingCategory, PackingType, PackingItemCreate, PackingItem } from '../store/types';

const props = defineProps<{
  visible: boolean;
  tripId: string;
  ownerId: string;
  loading: boolean;
  isEdit: boolean;
  itemToEdit?: PackingItem | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: PackingItemCreate): void;
  (e: 'update', payload: PackingItem): void;
  (e: 'close'): void;
}>();

// Local v-model for the dialog
const internalVisible = ref(props.visible);

const form = ref<Omit<PackingItemCreate, 'tripId' | 'ownerId'>>({
  name: '',
  quantity: 1,
  category: 'misc',
  type: 'personal',
  isPacked: false,
  dueDate: '',
  notes: '',
});

function resetForm() {
  form.value = {
    name: '',
    quantity: 1,
    category: 'misc',
    type: 'personal',
    isPacked: false,
    dueDate: '',
    notes: '',
  };
}

watch(
  () => props.visible,
  (val) => {
    internalVisible.value = val;
  },
);

watch(internalVisible, (val) => {
  if (!val) {
    emit('close');
    resetForm();
  }
});

// Prefill when editing
watch(
  () => props.itemToEdit,
  (item) => {
    if (props.isEdit && item) {
      form.value = {
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        type: item.type,
        isPacked: item.isPacked,
        dueDate: item.dueDate || '',
        notes: item.notes || '',
      };
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (props.isEdit && props.itemToEdit) {
    emit('update', {
      ...props.itemToEdit,
      ...form.value,
    });
  } else {
    emit('submit', {
      tripId: props.tripId,
      ownerId: props.ownerId,
      ...form.value,
    });
  }

  internalVisible.value = false;
}

function handleClose() {
  internalVisible.value = false;
  emit('close');
}

const categories: { label: string; value: PackingCategory }[] = [
  { label: 'Clothing', value: 'clothing' },
  { label: 'Food', value: 'food' },
  { label: 'Camping Gear', value: 'campingGear' },
  { label: 'Cooking', value: 'cooking' },
  { label: 'Safety', value: 'safety' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Personal Care', value: 'personalCare' },
  { label: 'Miscellaneous', value: 'misc' },
];

const types: { label: string; value: PackingType }[] = [
  { label: 'Personal', value: 'personal' },
  { label: 'Shared', value: 'shared' },
];
</script>

<style scoped>
.q-card {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
</style>
