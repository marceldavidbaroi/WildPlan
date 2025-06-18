<template>
  <q-page padding>
    <div class="absolute-full flex flex-center column text-primary">
      <q-spinner-ball size="lg" color="primary" />
      <div class="text-h5 q-mt-lg">Logging you out...</div>
      <div class="text-subtitle2 text-weight-light q-mt-sm">Please wait a moment</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store'; // update to your actual path

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.logout();

  setTimeout(() => {
    router.push('/auth/login');
  }, 3000);
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
