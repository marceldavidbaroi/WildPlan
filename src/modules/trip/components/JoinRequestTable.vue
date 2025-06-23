<template>
  <q-table :rows="rows" :columns="columns" row-key="uid" flat bordered dense class="q-mt-md">
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn dense color="secondary" label="Approve" size="sm" @click="emitApprove(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { joinRequest } from '../store/types';

const props = defineProps<{
  rows: joinRequest[];
}>();

const emit = defineEmits<{
  (e: 'approve', row: joinRequest): void;
}>();

const columns = [
  {
    name: 'displayName',
    label: 'Name',
    align: 'left' as const,
    field: 'displayName',
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left' as const,
    field: 'email',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'right' as const,
    field: 'uid', // or use a function if needed
    sortable: false,
  },
];

function emitApprove(row: joinRequest) {
  emit('approve', row);
}
</script>

<style scoped>
.q-table {
  border-radius: 12px;
  overflow: hidden;
}
</style>
