<template>
  <q-page padding class="bg-transparent">
    <q-btn-group unelevated>
      <q-btn
        icon="settings"
        :color="generalSettings ? 'primary' : 'black'"
        flat
        @click="generalSettings = true"
      />
      <q-btn
        icon="contacts"
        :color="generalSettings ? 'black' : 'primary'"
        flat
        @click="generalSettings = false"
      />
    </q-btn-group>

    <div v-if="generalSettings">
      <UserSettings
        :data="authStore.profile ?? {}"
        :loading="authStore.loading"
        @notification="handleSaveProfile"
        @theme="handleSaveProfile"
        @save-profile="handleSaveProfile"
      />
    </div>
    <div v-else>
      <ContactList
        :list="authStore.profile?.contacts ?? []"
        :users="allUsers ?? []"
        @update:list="onUpdateContact"
        @remove:contact="handleRemove"
      />
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { UserProfile, Contact } from '../store/types';
import UserSettings from '../components/UserGenetalSettings.vue'; // Adjust path as needed
import { useQuasar } from 'quasar';
import { useAuthStore } from '../store';
import ContactList from '../components/UserContact.vue';
const authStore = useAuthStore();

const $q = useQuasar();
const generalSettings = ref<boolean>(true);
const allUsers = ref<UserProfile[]>();

onMounted(async () => {
  await authStore.fetchAllUser();
  allUsers.value = authStore.allUsers?.filter((u) => u.email !== currentUserData.value?.email);
  $q.dark.set(authStore.profile?.preferences.theme === 'dark');
});

// Mock user data in the parent component
const currentUserData = ref<Partial<UserProfile> | null>(authStore.profile);

// Handlers for events emitted by the UserSettings component

const handleSaveProfile = async (updatedData: UserProfile) => {
  // This could be a separate API call for profile updates
  const response = await authStore.updateProfile(updatedData);
  currentUserData.value = { ...updatedData };
  $q.notify({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
  });
};

const onUpdateContact = async (val: Contact[]) => {
  const response = await authStore.updateProfile({ contacts: val });
  currentUserData.value = { ...{ contacts: val } };
  $q.notify({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
  });
};
const handleRemove = async (val: string) => {
  if (!currentUserData.value) return;

  const updatedContacts = currentUserData.value.contacts?.filter((c) => c.email !== val) || [];
  const response = await authStore.updateProfile({ contacts: updatedContacts });
  currentUserData.value = {
    ...currentUserData.value,
    contacts: updatedContacts,
  };

  $q.notify({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
  });
};
</script>

<style scoped></style>
