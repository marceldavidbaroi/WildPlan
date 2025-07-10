<template>
  <q-page class="q-pa-md flex flex-center">
    {{ authStore.profile }}
    <q-card style="max-width: 400px; width: 100%">
      <q-card-section>
        <div class="text-h6 q-mb-md">User Profile</div>

        <div class="row justify-center q-mb-md">
          <q-avatar size="100px">
            <img :src="photoURL || defaultAvatar" alt="Profile photo" />
          </q-avatar>
        </div>

        <q-form @submit.prevent="onSubmit" ref="formRef">
          <q-input
            filled
            v-model="displayName"
            label="Display Name"
            :rules="[(val) => !!val || 'Display Name is required']"
            lazy-rules
            autofocus
          />

          <q-input
            filled
            v-model="photoURL"
            label="Photo URL"
            type="url"
            class="q-mt-md"
            :rules="[(val) => !val || isValidUrl(val) || 'Invalid URL']"
            lazy-rules
          />

          <q-input filled label="Email" :value="email" readonly class="q-mt-md" />

          <div class="row justify-end q-mt-md">
            <q-btn label="Update Profile" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="negative" label="Logout" @click="logout" icon="logout" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../store';
// your Pinia store path

const $q = useQuasar();
const authStore = useAuthStore();

const displayName = ref('');
const photoURL = ref('');
const email = ref('');
const loading = ref(false);
const formRef = ref();

const defaultAvatar = 'https://cdn.quasar.dev/img/avatar.png';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Load user data from authStore (simulate)
onMounted(() => {
  // const user = authStore.getUser();
  // if (user) {
  //   displayName.value = user.displayName || '';
  //   photoURL.value = user.photoURL || '';
  //   email.value = user.email || '';
  // }
});

const onSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  loading.value = true;

  try {
    await authStore.updateProfile({
      displayName: displayName.value,
      photoURL: photoURL.value,
    });
    $q.notify({ type: 'positive', message: 'Profile updated (check console)' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Update failed (check console)' });
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    $q.notify({ type: 'info', message: 'Logged out (check console)' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Logout failed (check console)' });
  }
};
</script>
