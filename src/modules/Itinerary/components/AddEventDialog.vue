<template>
  <q-dialog v-model="localShow" persistent>
    <q-card style="min-width: 320px; max-width: 900px">
      <q-card-section>
        <q-btn
          icon="close"
          round
          dense
          flat
          color="grey-7"
          class="absolute-top-right q-mt-xs q-mr-xs"
          @click="closeDialog"
        />
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="onSubmit" @reset.prevent="onReset" ref="formRef">
          <div class="row q-col-gutter-md">
            <!-- Column 1 -->
            <div class="col-12 col-md-6 col-lg-4">
              <div class="q-gutter-sm">
                <q-input
                  v-model="localForm.name"
                  label="Event Name"
                  filled
                  dense
                  square
                  clearable
                  required
                  :rules="[(val) => !!val || 'Event name is required']"
                  hide-bottom-space
                />
                <q-input
                  v-model="localForm.description"
                  label="Description"
                  type="textarea"
                  filled
                  dense
                  square
                  autogrow
                  clearable
                />
                <TimePicker15Min v-model="localForm.startTime" label="Start Time" />
                <TimePicker15Min v-model="localForm.endTime" label="End Time" />
              </div>
            </div>
            <!-- Column 2 -->
            <div class="col-12 col-md-6 col-lg-4">
              <div class="q-gutter-sm">
                <q-input
                  v-model="localForm.locationName"
                  label="Location Name"
                  filled
                  dense
                  square
                  clearable
                />
                <q-input
                  v-model="localForm.address"
                  label="Address"
                  filled
                  dense
                  square
                  clearable
                />
                <MapPicker :initial-location="initialLocation" @picked="onLocationPicked" />
                Latitude: {{ localForm.coordinates?.lat }} <br />
                Longitude: {{ localForm.coordinates?.lng }}
              </div>
            </div>
            <!-- Column 3 -->
            <div class="col-12 col-md-12 col-lg-4">
              <div class="q-gutter-sm">
                <q-select
                  v-model="localForm.category"
                  :options="categoryOptions"
                  option-label="label"
                  option-value="value"
                  label="Category"
                  filled
                  dense
                  square
                  clearable
                  required
                />
                <q-select
                  v-model="localForm.assignedTo"
                  :options="userOptions"
                  label="Assigned To"
                  multiple
                  use-chips
                  option-value="uid"
                  option-label="displayName"
                  map-options
                  emit-value
                  filled
                  dense
                  square
                  clearable
                />
                <q-select
                  v-model="localForm.packingItemsNeeded"
                  :options="props.packingItems"
                  label="Packing Items Needed"
                  multiple
                  use-chips
                  filled
                  dense
                  square
                  clearable
                  emit-value
                  map-options
                  option-label="name"
                  option-value="id"
                  :disable="props.packingItems.length === 0"
                />
                <div class="row justify-end q-pa-none q-ma-none">
                  <q-chip
                    clickable
                    color="primary"
                    text-color="white"
                    icon="add"
                    label="add packing Item"
                    size="xs"
                    class="q-mt-sm"
                    @click="goToPackingItemsPage"
                  />
                </div>

                <q-input
                  v-model.number="localForm.budgetImpact.estimatedCost"
                  label="Estimated Cost"
                  type="number"
                  prefix="$"
                  filled
                  dense
                  square
                  clearable
                />
                <q-input
                  v-model="localForm.notes"
                  label="Notes"
                  type="textarea"
                  filled
                  dense
                  square
                  autogrow
                  clearable
                />
              </div>
            </div>
            <!-- Buttons -->
            <div class="col-12 q-pt-md text-right">
              <q-btn color="grey" flat icon="restart_alt" label="Reset" @click="onReset" />
              <q-btn
                type="submit"
                color="primary"
                flat
                icon="send"
                label="Submit"
                class="q-ml-sm"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import TimePicker15Min from 'src/components/TimePicker.vue';
import MapPicker from 'src/components/MapPicker.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// Props
const props = defineProps({
  show: Boolean,
  form: {
    type: Object,
    required: true,
  },
  initialLocation: {
    type: Object,
    default: null,
  },
  categoryOptions: {
    type: Array,
    default: () => [],
  },
  userOptions: {
    type: Array,
    default: () => [],
  },
  packingItemOptions: {
    type: Array,
    default: () => [],
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  packingItems: {
    type: Array,
    default: () => [],
  },
  tripId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:show', 'submit', 'location-picked']);

// Local dialog visibility
const localShow = ref(props.show);

// Reactive form data
const localForm = ref(JSON.parse(JSON.stringify(props.form)));

// ----------------------
// Watchers
// ----------------------

// Sync localShow with props.show
watch(
  () => props.show,
  (val) => {
    localShow.value = val;
  },
);

// Emit show update and reset form if not editing
watch(localShow, (val) => {
  emit('update:show', val);
  if (val && !props.isEdit) {
    resetForm();
  }
});

// Sync external prop updates into local form
watch(
  () => props.form,
  (newForm) => {
    localForm.value = JSON.parse(JSON.stringify(newForm));
  },
  { deep: true },
);

// ----------------------
// Methods
// ----------------------

function closeDialog() {
  localShow.value = false;
}

function onSubmit() {
  emit('submit', JSON.parse(JSON.stringify(localForm.value)));
  closeDialog();
}

function resetForm() {
  localForm.value = {
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
}

function onReset() {
  resetForm();
}

function onLocationPicked(location: { lat: number; lng: number }) {
  localForm.value.coordinates = location;
  emit('location-picked', location);
}

async function goToPackingItemsPage() {
  await router.push({ path: `/packing/${props.tripId}` });
}
</script>

<style scoped>
.absolute-top-right {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}
</style>
