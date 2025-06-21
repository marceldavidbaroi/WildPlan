<template>
  <q-dialog v-model="show">
    <q-card class="q-pa-md" style="min-width: 350px">
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="warning" color="negative" size="32px" />
        <div class="text-h6 text-negative">Confirm Deletion</div>
      </q-card-section>

      <q-card-section class="text-body2">
        <div v-if="message" class="q-mb-sm">{{ message }}</div>
        <div v-if="verifyText">
          Type <span class="text-negative text-bold">{{ verifyText }}</span> to confirm
        </div>
        <div v-if="verifyText">
          <q-input
            v-model="userInput"
            :label="`Type '${verifyText}' to confirm`"
            :placeholder="`Type '${verifyText}' to confirm`"
            dense
            outlined
            :rules="[(val) => val === verifyText || `Must match '${verifyText}'`]"
            class="q-mb-md"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="cancel" />
        <q-btn
          :label="loading ? 'Deleting...' : 'Delete'"
          color="negative"
          :disable="!!verifyText && userInput !== verifyText"
          :loading="loading"
          @click="confirm"
          icon="delete_forever"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  message?: string;
  verifyText?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const show = ref(props.modelValue);
const userInput = ref('');

watch(
  () => props.modelValue,
  (val) => (show.value = val),
);
watch(show, (val) => emit('update:modelValue', val));

function confirm() {
  emit('confirm');
}

function cancel() {
  emit('cancel');
  show.value = false;
}
</script>
