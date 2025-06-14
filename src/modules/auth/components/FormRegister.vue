<template>
  <div>
    <q-input
      v-model="email"
      outlined
      color="white"
      label="Email"
      type="email"
      class="q-mb-md white-input"
    />
    <q-input
      v-model="password"
      outlined
      label="Password"
      type="password"
      class="q-mb-md white-input"
    />
    <q-input
      v-model="confirmPassword"
      outlined
      label="Confirm Password"
      type="password"
      class="q-mb-md white-input"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';

const email = defineModel<string>('email');
const password = defineModel<string>('password');
const confirmPassword = defineModel<string>('confirmPassword');
</script>

<style scoped lang="scss">
.white-input {
  ::v-deep .q-field__control {
    border: 1px solid white !important;
    color: white !important;
  }

  ::v-deep .q-field__control:focus,
  ::v-deep .q-field--focused .q-field__control,
  ::v-deep .q-field--hovered .q-field__control {
    border-color: white !important;
    box-shadow: 0 0 0 1px white !important;
  }

  ::v-deep .q-field__label {
    color: white !important;
  }

  ::v-deep .q-field__native,
  ::v-deep .q-field__prefix,
  ::v-deep .q-field__suffix {
    color: white !important;
  }

  ::v-deep input::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  ::v-deep .q-icon {
    color: white !important;
  }
}
</style>
