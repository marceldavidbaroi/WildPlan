<template>
  <q-dialog v-model="isDialogOpen" persistent>
    <q-card class="q-pa-md" style="min-width: 500px">
      <q-card-section>
        <div class="text-h6"><q-icon name="luggage" size="lg" /> Create New Trip</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-form @submit.prevent="submitForm" class="q-gutter-md">
          <!-- Trip Name -->
          <q-input v-model="form.name" label="Trip Name" filled required>
            <template v-slot:prepend>
              <q-icon name="travel_explore" />
            </template>
          </q-input>

          <!-- Location -->
          <q-input
            v-model="form.location.name"
            label="Location Name"
            filled
            required
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" />
            </template>
          </q-input>

          <!-- Dates -->
          <div class="row">
            <div class="col q-mr-xs">
              <q-input v-model="form.startDate" label="Start Date" filled readonly required>
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.startDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-input>
            </div>

            <div class="col q-ml-xs">
              <q-input v-model="form.endDate" label="End Date" filled readonly required>
                <template v-slot:prepend>
                  <q-icon name="event_available" />
                </template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.endDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-input>
            </div>
          </div>

          <!-- Created By -->
          <!-- <q-input v-model="form.createdBy" label="Created By (UID)" filled required>
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input> -->

          <!-- Members -->
          <q-select
            v-model="form.members"
            label="Members"
            filled
            use-chips
            multiple
            use-input
            input-debounce="300"
            new-value-mode="add"
            hint="Select member"
            :options="options"
            option-label="email"
            option-value="uid"
            map-options
            emit-value
            clearable
            @filter="filterMembers"
          >
            <template #prepend>
              <q-icon name="group" />
            </template>
          </q-select>

          <!-- Invite Code -->
          <q-input v-model="form.inviteCode" label="Invite Code" filled>
            <template v-slot:prepend>
              <q-icon name="key" />
            </template>
          </q-input>

          <!-- Photo URL -->
          <!-- <q-input v-model="form.photoURL" label="Photo URL" filled>
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
          </q-input> -->

          <!-- Status -->
          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status"
            filled
            emit-value
            map-options
            required
          >
            <template v-slot:prepend>
              <q-icon name="flag" />
            </template>
          </q-select>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeDialog" />
        <q-btn label="Create" color="primary" @click="submitForm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, reactive } from 'vue';
import type { TripCreateData } from '../modules/trip/store/types';
import { useAuthStore } from 'src/modules/auth/store';
import type { UserProfile } from '../modules/auth/store/types';

const authStore = useAuthStore();

const emits = defineEmits<{
  (e: 'submit', data: TripCreateData): void;
  (e: 'close'): void;
}>();

// Controls dialog visibility from parent
const props = defineProps<{
  modelValue: boolean;
  allusers: UserProfile[];
}>();

const isDialogOpen = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (isDialogOpen.value = val),
);
watch(isDialogOpen, (val) => {
  if (!val) emits('close');
});

const statusOptions: TripCreateData['status'][] = ['upcoming', 'completed', 'cancelled'];

const form = reactive({
  name: '',
  location: {
    name: '',
    lat: 0,
    lng: 0,
  },
  startDate: '',
  endDate: '',
  createdBy: authStore.profile!.uid,
  members: [],
  inviteCode: '',
  photoURL: null,
  status: 'upcoming' as TripCreateData['status'],
});

function resetForm() {
  form.name = '';
  form.location.name = '';
  form.location.lat = 0;
  form.location.lng = 0;
  form.startDate = '';
  form.endDate = '';
  form.members = [];
  form.inviteCode = '';
  form.photoURL = null;
  form.status = 'upcoming';
}

function closeDialog() {
  resetForm();
  isDialogOpen.value = false;
}

function submitForm() {
  const membersArray = form.members;

  const payload: TripCreateData = {
    name: form.name,
    location: {
      name: form.location.name,
      lat: form.location.lat,
      lng: form.location.lng,
    },
    startDate: form.startDate,
    endDate: form.endDate,
    createdBy: form.createdBy,
    members: membersArray,
    inviteCode: form.inviteCode || undefined,
    photoURL: form.photoURL || '/images/placeholder.png',
    status: form.status,
  };
  resetForm();

  emits('submit', payload);
  closeDialog();
}

// Options for the select (filtered)
const options = ref<UserProfile[]>([...props.allusers]);

// Filter method
function filterMembers(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      options.value = props.allusers;
    });
    return;
  }

  const needle = val.toLowerCase();
  update(() => {
    options.value = props.allusers.filter((user) => user.email!.toLowerCase().includes(needle));
  });
}
</script>
