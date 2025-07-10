<template>
  <div class="flex flex-center" style="min-height: 100vh; background-color: #f5f5f5">
    <div class="q-pa-md text-center" style="max-width: 400px; width: 100%">
      <q-icon name="sentiment_dissatisfied" size="64px" color="negative" />
      <h2 class="q-mt-md text-h5 text-negative">404 - Page Not Found</h2>
      <p class="text-subtitle2 text-grey-7 q-mt-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <q-btn
        v-if="authStore.isAuthenticated"
        label="Go to Dashboard"
        color="primary"
        class="q-mt-md full-width"
        to="/dashboard"
        unelevated
      />
      <q-btn
        v-else
        label="Go to Home"
        color="primary"
        class="q-mt-md full-width"
        to="/"
        unelevated
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/modules/auth/store';

const authStore = useAuthStore();

// No script needed
</script>

<style scoped>
/* Clean and minimal */
</style>
