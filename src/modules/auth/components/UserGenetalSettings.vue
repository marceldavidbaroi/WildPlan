<template>
  <div class="settings-page flex q-pa-md">
    <q-card class="settings-card shadow-2">
      <q-card-section class="text-center q-pt-lg">
        <div v-if="loading">
          <q-spinner-ball color="primary" size="lg" />
        </div>
        <div v-else>
          <q-avatar size="100px" class="q-mb-md">
            <img
              :src="userData.photoURL || 'https://www.gravatar.com/avatar/?d=mp'"
              alt="Profile Picture"
            />
          </q-avatar>
          <div class="text-h5 text-weight-bold q-mb-xs">{{ userData.displayName }}</div>
          <div class="text-subtitle1 text-grey-7">{{ userData.email }}</div>
        </div>
      </q-card-section>

      <q-separator inset class="q-my-md" />

      <q-card-section>
        <q-list class="q-mt-sm">
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-icon name="notifications" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Notifications</q-item-label>
              <q-item-label caption>Receive email and app notifications</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="notifications"
                color="primary"
                @update:model-value="onChangeNotification"
              />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-icon name="palette" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Theme</q-item-label>
              <q-item-label caption>Choose your preferred app theme</q-item-label>
            </q-item-section>
            <q-item-section side class="theme-select-side-section">
              <q-select
                outlined
                v-model="selectedTheme"
                :options="themeOptions"
                dense
                options-dense
                emit-value
                map-options
                @update:model-value="onThemeChange"
                color="primary"
                class="theme-select-input"
              />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="editProfile">
            <q-item-section avatar>
              <q-icon name="edit" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Edit Profile</q-item-label>
              <q-item-label caption>Update your name, email, or photo</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- <q-card-actions align="right" class="q-pt-md q-px-md q-pb-md">
        <q-btn flat label="Save Changes" color="primary" @click="saveSettings" />
      </q-card-actions> -->
    </q-card>

    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="userData.displayName"
            label="Display Name"
            autofocus
            @keyup.enter="saveEditedProfile"
          />
          <!-- <q-input dense v-model="userData.email" label="Email" class="q-mt-sm" /> -->
          <q-input dense v-model="userData.photoURL" label="Photo URL" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" @click="saveEditedProfile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { UserProfile } from '../store/types'; // Import from your store types

const props = defineProps<{
  data: Partial<UserProfile>;
  loading: boolean;
}>();

const userData = ref<Partial<UserProfile>>(props.data);
const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System Default', value: 'system' },
];

const selectedTheme = ref<string>('');
const notifications = ref<boolean>();

onMounted(() => {
  selectedTheme.value = userData.value.preferences?.theme ?? 'light';
  notifications.value = userData.value.preferences?.notifications;
});

const emit = defineEmits(['theme', 'notification', 'saveProfile']);

const showEditDialog = ref(false);

function editProfile() {
  userData.value = JSON.parse(JSON.stringify(userData.value));
  showEditDialog.value = true;
}
function onThemeChange(val: string) {
  const payload = {
    preferences: {
      ...userData.value.preferences,
      theme: val,
    },
  };
  console.log(payload);
  emit('theme', payload);
}

function onChangeNotification(val: boolean) {
  const payload = {
    preferences: {
      ...userData.value.preferences,
      notifications: val,
    },
  };
  console.log(payload);

  emit('notification', payload);
}
function saveEditedProfile() {
  userData.value = { ...userData.value };
  console.log(userData.value);
  showEditDialog.value = false;
  console.log(userData.value);
  emit('saveProfile', userData.value);
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 50px);
  align-items: flex-start;
  justify-content: center;
}

@media (min-width: 600px) {
  .settings-page {
    align-items: center;
  }
}

.settings-card {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.q-avatar img {
  object-fit: cover;
}

.q-item {
  transition: background-color 0.3s ease;
}
.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.theme-select-side-section {
  flex-shrink: 1;
  flex-basis: auto;
}

.theme-select-input {
  min-width: 90px;
}

@media (max-width: 380px) {
  .theme-select-input {
    min-width: 80px;
  }
}
</style>
