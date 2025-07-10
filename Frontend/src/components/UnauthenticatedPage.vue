<template>
  <div class="flex flex-center" style="min-height: 100vh; background-color: #f5f5f5">
    <div class="q-pa-md text-center" style="max-width: 400px; width: 100%">
      <q-icon name="lock" size="64px" color="primary" />
      <h2 class="q-mt-md text-h5 text-primary">Access Denied</h2>
      <p class="text-subtitle2 text-grey-7 q-mt-sm">You must be logged in to access this page.</p>

      <q-btn
        label="Go to Login"
        color="primary"
        class="q-mt-md full-width"
        to="/auth/login"
        unelevated
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
/* Clean and minimal */
</style>
