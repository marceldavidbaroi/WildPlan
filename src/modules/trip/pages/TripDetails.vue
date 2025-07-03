<template>
  <q-page class="q-pa-none">
    <!-- Banner Section -->
    <div class="trip-banner">
      <q-img :src="trip?.photoURL || fallbackImage" :alt="trip?.name" class="banner-img">
        <div class="banner-overlay column justify-end">
          <div class="row justify-between items-center q-px-md q-pt-md">
            <div class="text-h5 text-bold text-white">{{ trip?.name }}</div>
            <div v-if="isEditor" class="row">
              <q-btn-dropdown
                color="white"
                :label="selectedStatusLabel"
                text-color="primary"
                class="q-py-none"
                size="sm"
                dense
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
              <q-btn flat round icon="share" color="white" @click="onShare" />
              <q-btn
                flat
                round
                :icon="trip?.archived ? 'folder_zip' : 'folder_open'"
                color="white"
                @click="onArchive()"
              />
              <q-btn
                flat
                round
                :icon="trip?.isPublic ? 'public' : 'lock_person'"
                color="white"
                @click="onVisibilityChange"
              />
              <q-btn
                flat
                round
                icon="add_photo_alternate"
                color="white"
                @click="showPhotoDialog = true"
              />
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
      <div class="flex flex-center">
        <q-btn color="info" flat no-caps dense size="md" icon="task" @click="onTaskClick">
          <q-tooltip>Add Task for Trip</q-tooltip>
        </q-btn>
        <q-btn
          color="info"
          flat
          no-caps
          dense
          size="md"
          icon="event_note"
          @click="onItineraryClick"
        >
          <q-tooltip>View itinerary</q-tooltip>
        </q-btn>

        <q-btn color="info" flat no-caps dense size="md" icon="card_travel" @click="onPackingClick">
          <q-tooltip>Manage packing list</q-tooltip>
        </q-btn>
      </div>
      <q-separator />

      <div class="row q-mt-md">
        <!-- Dates & Status -->
        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="event" />
          <div>
            <div class="text-subtitle2 text-bold">Trip Dates</div>
            <div class="text-caption">
              {{ formatDate(trip?.startDate) }} → {{ formatDate(trip?.endDate) }}
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="info" />
          <div>
            <div class="text-subtitle2 text-bold">Status</div>
            <q-chip square dense :color="getStatusColor(trip?.status)" text-color="white">
              {{ trip?.status }}
            </q-chip>
          </div>
        </div>

        <!-- People -->
        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="group" />
          <div @click="showMemberTable = !showMemberTable" style="cursor: pointer">
            <div class="text-subtitle2 text-bold">
              Members <q-icon :name="showMemberTable ? 'expand_less' : 'expand_more'" />
            </div>
            <div class="text-caption">{{ trip?.members.length }} participant(s)</div>
          </div>
        </div>

        <!-- table of memebers -->
        <div v-if="showMemberTable" class="col-12">
          <q-btn
            v-if="!showMemberDropdown"
            color="primary"
            icon="group_add"
            label="Add members"
            flat
            @click="showMemberDropdown = true"
          />
          <div v-if="showMemberDropdown">
            <q-card flat bordered class="q-pa-md q-mt-sm bg-transparent">
              <q-card-section class="q-pb-none">
                <div class="text-h6">Add Member</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div v-if="nonMembers.length">
                  <q-select
                    v-model="selectedMembers"
                    :options="nonMembers"
                    multiple
                    use-chips
                    map-options
                    emit-value
                    option-label="email"
                    option-value="uid"
                    label="Select members to add"
                    filled
                    dense
                    class="q-mb-md"
                  />

                  <div class="row justify-end q-gutter-sm">
                    <q-btn
                      flat
                      color="primary"
                      label="Cancel"
                      @click="showMemberDropdown = false"
                    />
                    <q-btn color="primary" label="Save" @click="addMembers" />
                  </div>
                </div>

                <div v-else class="bg-grey-1 text-dark q-pa-md rounded-borders relative-position">
                  <div class="text-body1">
                    All your contacts are already part of this trip.
                    <br />
                    To add others, first add them to your contacts or share the trip link.
                  </div>
                  <q-btn
                    icon="close"
                    flat
                    dense
                    round
                    size="sm"
                    class="absolute-top-right"
                    @click="showMemberDropdown = false"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <q-table
            :rows="memberRows || []"
            :columns="columns"
            row-key="name"
            dense
            class="bg-transparent q-mb-lg"
            flat
            bordered
            :pagination="{ rowsPerPage: 0 }"
            hide-bottom
          >
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  icon="delete"
                  color="negative"
                  flat
                  size="sm"
                  round
                  dense
                  @click="deleteMember(props.row.uid)"
                />
              </q-td>
            </template>
          </q-table>
        </div>

        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="person" />
          <div>
            <div class="text-subtitle2 text-bold">Created By</div>
            <div class="text-caption">{{ findUserById(trip?.createdBy)?.[0]?.displayName }}</div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="code" />
          <div>
            <div class="text-subtitle2 text-bold">Invite Code</div>
            <div class="text-caption">{{ trip?.inviteCode }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="history" />
          <div>
            <div class="text-subtitle2 text-bold">Created</div>
            <div class="text-caption">{{ formatDateTime(trip?.createdAt) }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="update" />
          <div>
            <div class="text-subtitle2 text-bold">Last Updated</div>
            <div class="text-caption">{{ formatDateTime(trip?.updatedAt) }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 q-mb-lg row items-center q-gutter-md">
          <q-icon name="place" />
          <div>
            <div class="text-subtitle2 text-bold">Location</div>
            <div class="text-caption">
              <div v-if="authStore.profile?.uid === tripStore.activeTrip?.createdBy">
                <MapPicker :initial-location="initialLocation" @picked="onLocationPicked" />
              </div>
              <div class="">
                <div class="">
                  {{ tripStore.activeTrip?.location.name || 'Unknown Location' }}
                </div>
                <div class="row q-mt-sm items-center">
                  <div class="col-auto">
                    <q-icon name="place" color="primary" class="q-mr-xs" />
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-8">
                      Latitude: {{ tripStore.activeTrip?.location.lat }}
                    </div>
                    <div class="text-caption text-grey-8">
                      Longitude: {{ tripStore.activeTrip?.location.lng }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- for bg image  -->

    <q-dialog v-model="showPhotoDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Photo Link</div>
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            v-model="photoLink"
            label="Photo URL"
            type="url"
            placeholder="https://example.com/photo.jpg"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            :disable="!isValidUrl(photoLink)"
            @click="savePhotoLink"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, ref } from 'vue';
import { useTripStore } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { date, Notify, copyToClipboard } from 'quasar';
import { useAuthStore } from 'src/modules/auth/store';
import MapPicker from 'src/components/MapPicker.vue';
const authStore = useAuthStore();

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();

const fallbackImage = 'https://cdn.quasar.dev/img/parallax2.jpg';

const id = ref();
const showPhotoDialog = ref<boolean>(false);
const isEditor = ref<boolean>(false);
const showMemberTable = ref<boolean>(false);
const showMemberDropdown = ref<boolean>(false);
const selectedMembers = ref<string[]>();
const memberRows = ref();
const nonMembers = ref();
const initialLocation = ref();

onMounted(async () => {
  const rawId = route.params.id;
  id.value = Array.isArray(rawId) ? rawId[0] : rawId;

  if (typeof id.value !== 'string') {
    await router.replace('/not-found');
    return;
  }

  await tripStore.fetchTrip(id.value);
  await authStore.fetchAllUser();
  selectedStatus.value = tripStore.activeTrip?.status;
  // find user role
  const userId = authStore.profile?.uid;
  const roles = tripStore.activeTrip?.roles || [];
  const userRole = roles?.filter((r) => r.uid === userId);

  isEditor.value = !(userRole[0]?.role.includes('member') || userRole[0]?.role.includes('guest'));

  memberRows.value = authStore.allUsers?.filter((user) =>
    tripStore.activeTrip?.members.includes(user.uid),
  );

  nonMembers.value = authStore.profile?.contacts?.filter(
    (user) => !tripStore.activeTrip?.involvedUsers.includes(user.uid),
  );

  initialLocation.value = tripStore.activeTrip?.location;
});

watch(
  () => tripStore.activeTrip, // watch the activeTrip object
  (newTrip) => {
    if (!newTrip) return;

    // Update memberRows
    memberRows.value = authStore.allUsers?.filter((user) => newTrip.members.includes(user.uid));

    // Update nonMembers
    nonMembers.value = authStore.profile?.contacts?.filter(
      (user) => !newTrip.involvedUsers.includes(user.uid),
    );
  },
  { immediate: true }, // run on initial load
);

const columns = [
  {
    name: 'displayName',
    align: 'center' as const,
    label: 'Name',
    field: 'displayName',
    sortable: true,
  },
  { name: 'email', align: 'center' as const, label: 'Email', field: 'email', sortable: true },

  {
    name: 'actions',
    label: 'Delete',
    align: 'center' as const,
    field: 'uid', // assuming 'uid' is unique per user
    sortable: false,
  },
];

async function deleteMember(memberId: string) {
  const filterMembers = tripStore.activeTrip?.members.filter((m) => m !== memberId);
  const filterInvolvedUsers = tripStore.activeTrip?.involvedUsers.filter((m) => m !== memberId);
  const existingRoles = tripStore.activeTrip?.roles;
  const newRoles = existingRoles?.filter((r) => r.uid !== memberId);
  const payload = {
    members: filterMembers,
    involvedUsers: filterInvolvedUsers,
    roles: newRoles,
  };
  await updateTripDetails(id.value, payload);
}
const trip = computed(() => tripStore.activeTrip);

function formatDate(input?: string | number): string {
  return input ? date.formatDate(new Date(input), 'MMM D, YYYY') : '';
}

function formatDateTime(input?: number): string {
  return input ? date.formatDate(new Date(input), 'MMM D, YYYY – h:mm A') : '';
}

function findUserById(id: string | undefined) {
  return authStore.allUsers?.filter((user) => user.uid === id);
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

async function openSettings() {
  await router.push({ path: `/trip/settings/${id.value}` });
}

async function onVisibilityChange() {
  const payload = {
    isPublic: tripStore.activeTrip?.isPublic ? false : true,
  };
  await updateTripDetails(id.value, payload);
}

async function updateTripDetails(id: string, payload: object) {
  const response = await tripStore.updateTrip(id, payload);
  Notify.create({
    position: 'top',
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });
}

async function onArchive() {
  const payload = {
    archived: !tripStore.activeTrip?.archived,
  };
  await updateTripDetails(id.value, payload);
}
async function addMembers() {
  const existingMembers = tripStore.activeTrip?.members || [];
  const existingInvolvedUsers = tripStore.activeTrip?.involvedUsers || [];
  const newMembers = selectedMembers.value || [];
  const existingRoles = tripStore.activeTrip?.roles || [];
  for (const member of newMembers) {
    existingRoles.push({ uid: member, role: ['member'], adminestrator: false });
  }

  // Merge and remove duplicates
  const combinedMembers = Array.from(new Set([...existingMembers, ...newMembers]));
  const combinedInvolvedUsers = Array.from(new Set([...existingInvolvedUsers, ...newMembers]));

  const payload = {
    members: combinedMembers,
    involvedUsers: combinedInvolvedUsers,
    roles: existingRoles,
  };

  await updateTripDetails(id.value, payload);

  showMemberDropdown.value = false;
}

const photoLink = ref('');

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function savePhotoLink() {
  const payload = {
    photoURL: photoLink.value,
  };
  await updateTripDetails(id.value, payload);
  showPhotoDialog.value = false;
}

const selectedStatus = ref<'upcoming' | 'completed' | 'cancelled' | undefined>('upcoming');

const statusOptions: { label: string; value: 'upcoming' | 'completed' | 'cancelled' }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const selectedStatusLabel = computed(() => {
  return statusOptions.find((opt) => opt.value === selectedStatus.value)?.label || '';
});

async function selectStatus(status: 'upcoming' | 'completed' | 'cancelled') {
  selectedStatus.value = status;
  const payload = {
    status: status,
  };
  await updateTripDetails(id.value, payload);
}

async function onLocationPicked(coords: object) {
  const newLocation = {
    name: tripStore.activeTrip?.location.name,
    ...coords,
  };
  const payload = {
    location: newLocation,
  };

  await updateTripDetails(id.value, payload);
  initialLocation.value = newLocation;
  // e.g., save to form, update store, etc.
}

function onShare() {
  const shareData = `${window.location.origin}/trip/join/${id.value}`;

  copyToClipboard(shareData)
    .then(() => {
      Notify.create({
        position: 'top',
        type: 'positive',
        message: 'Link copied to clipboard!',
        timeout: 2000,
        icon: 'link',
      });
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        type: 'negative',
        message: 'Failed to copy link.',
        timeout: 2000,
        icon: 'error',
      });
    });
}

async function onItineraryClick() {
  await router.push({ path: `/itinerary/${id.value}` });
}
async function onPackingClick() {
  await router.push({ path: `/packing/${id.value}` });
}
async function onTaskClick() {
  await router.push({ path: `/tasks/${id.value}` });
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

.col-12 col-sm-6 {
  align-items: center;
}

.text-subtitle2 {
  font-size: 1rem;
}
</style>
