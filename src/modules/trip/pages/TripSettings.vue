<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Trip Settings</div>
      <q-btn flat round icon="arrow_back" @click="router.back()" />
    </div>

    <q-card flat class="q-pa-md bg-transparent">
      <q-tabs
        v-model="tab"
        active-color="white"
        active-bg-color="primary"
        bg-color="grey-3"
        align="left"
        class="text-primary"
        dense
      >
        <q-tab name="general" label="General" />
        <q-tab name="members" label="Members" />
        <q-tab name="access" label="Access" />
        <q-tab name="metadata" label="Metadata" />
        <q-tab name="danger" label="Danger Zone" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="q-mt-md bg-transparent">
        <!-- GENERAL -->
        <q-tab-panel name="general">
          <div class="text-h6 q-mb-md">General Information</div>
          <div class="row q-col-gutter-md">
            <q-input v-model="trip.name" label="Trip Name" filled class="col-12 col-md-6" />
            <q-input v-model="trip.location.name" label="Location" filled class="col-12 col-md-6" />
            <q-input
              filled
              v-model="trip.startDate"
              mask="date"
              label="Start Date"
              class="col-12 col-sm-6"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="startDatePopup"
                  >
                    <q-date v-model="trip.startDate" @update:model-value="startDatePopup?.hide()">
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              filled
              v-model="trip.endDate"
              mask="date"
              label="End Date"
              class="col-12 col-sm-6"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ref="endDatePopup"
                  >
                    <q-date v-model="trip.endDate" @update:model-value="endDatePopup?.hide()">
                      <div class="row items-center justify-end q-pa-sm">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input v-model="trip.photoURL" label="Photo URL" filled class="col-12" />
          </div>
          <div class="row justify-end q-mt-md">
            <q-btn label="cancel" color="primary" flat @click="onCancle" />
            <q-btn label="save" color="primary" @click="onSave" :loading="tripStore.loading" />
          </div>
        </q-tab-panel>

        <!-- MEMBERS -->
        <q-tab-panel name="members">
          <div class="text-h6 q-mb-sm">Trip Members</div>
          <div class="text-caption text-grey q-mb-md">
            Created by <strong>{{ trip.createdBy }}</strong>
          </div>
          <div class="row q-col-gutter-sm">
            <q-chip
              v-for="member in trip.members"
              :key="member"
              color="secondary"
              text-color="white"
              icon="person"
              class="q-mr-sm"
            >
              {{ member }}
            </q-chip>
          </div>
        </q-tab-panel>

        <!-- ACCESS -->
        <q-tab-panel name="access">
          <div class="text-h6 q-mb-sm">Access</div>
          <q-input
            v-model="trip.inviteCode"
            filled
            dense
            readonly
            append="content_copy"
            class="q-mb-md"
            @click:append="copyInviteCode"
          />
          <div class="text-caption text-grey q-mb-lg">Share this code to invite others.</div>

          <q-toggle
            v-model="isArchived"
            label="Archive this trip"
            color="primary"
            @update:model-value="onArchiveToggle"
          />
          <div class="text-caption text-grey">Archived trips are hidden from the main list.</div>
        </q-tab-panel>

        <!-- METADATA -->
        <q-tab-panel name="metadata">
          <div class="text-h6 q-mb-sm">Metadata</div>
          <div class="row q-col-gutter-md">
            <q-input
              :model-value="trip.id"
              label="Trip ID"
              filled
              disable
              class="col-12 col-md-6"
            />
            <q-input
              :model-value="trip.status"
              label="Status"
              filled
              disable
              class="col-12 col-md-6"
            />
            <q-input
              :model-value="formatDate(trip.createdAt)"
              label="Created At"
              filled
              disable
              class="col-12 col-md-6"
            />
            <q-input
              :model-value="formatDate(trip.updatedAt)"
              label="Updated At"
              filled
              disable
              class="col-12 col-md-6"
            />
          </div>
        </q-tab-panel>

        <!-- DANGER ZONE -->
        <q-tab-panel name="danger">
          <div class="text-h6 text-negative q-mb-sm">Danger Zone</div>
          <q-btn
            flat
            color="negative"
            icon="delete_forever"
            label="Delete Trip"
            @click="confirmDelete"
            class="q-mb-md"
          />
          <div class="text-caption text-grey">Once deleted, this trip cannot be recovered.</div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTripStore } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, date, Notify } from 'quasar';
import { QPopupProxy } from 'quasar';
import type { Trip } from '../store/types';

const route = useRoute();

const router = useRouter();
const $q = useQuasar();
const tripStore = useTripStore();

const startDatePopup = ref<InstanceType<typeof QPopupProxy> | null>(null);
const endDatePopup = ref<InstanceType<typeof QPopupProxy> | null>(null);

const trip = computed(() => tripStore.activeTrip!);
const tab = ref('general');
const isArchived = ref(trip.value.archived ?? false);
const id = ref();
const originalTrip = ref<Trip>();
const success = ref<boolean>(false);
const message = ref<string>('');

onMounted(() => {
  id.value = route.params.id;
  originalTrip.value = JSON.parse(JSON.stringify(trip.value));
});

function formatDate(ts: number) {
  return date.formatDate(new Date(ts), 'YYYY MMM D, HH:mm');
}

function copyInviteCode() {
  navigator.clipboard.writeText(trip.value.inviteCode || '');
  $q.notify({
    type: 'positive',
    message: 'Invite code copied!',
    icon: 'check',
  });
}

function onArchiveToggle(val: boolean) {
  isArchived.value = val;
  trip.value.archived = val;
  trip.value.updatedAt = Date.now();
  $q.notify({
    type: 'info',
    message: val ? 'Trip archived' : 'Trip unarchived',
    icon: 'archive',
  });
}

function confirmDelete() {
  $q.dialog({
    title: 'Delete Trip',
    message: 'This will permanently delete the trip. Continue?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({ type: 'negative', message: 'Trip deleted (mocked)' });
    router.push('/trip');
  });
}

const onCancle = () => {
  if (!originalTrip.value) return;
  Object.assign(trip.value, JSON.parse(JSON.stringify(originalTrip.value)));
  isArchived.value = originalTrip.value.archived ?? false;
  success.value = true;
  message.value = 'Changes reverted';
  success.value = true;

  Notify.create({
    position: 'top',
    type: 'info',
    message: 'Changes reverted',
    icon: 'undo',
  });
};
const onSave = async () => {
  const data: Partial<Trip> = {
    name: trip.value.name,
    location: trip.value.location,
    startDate: trip.value.startDate,
    endDate: trip.value.endDate,
    createdBy: trip.value.createdBy,
    members: trip.value.members,
    involvedUsers: trip.value.involvedUsers,
    inviteCode: trip.value.inviteCode,
    photoURL: trip.value.photoURL,
    status: trip.value.status,
    archived: isArchived.value,
    createdAt: trip.value.createdAt,
    updatedAt: Date.now(),
  };

  const response = await tripStore.updateTrip(id.value, data);

  Notify.create({
    type: response?.success ? 'positive' : 'negative',
    position: 'top',
    message: response?.message || 'Something went wrong',
    color: response?.success ? 'info' : 'negative',
    icon: response?.success ? 'check' : 'error',
    timeout: 3000,
  });
};
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
