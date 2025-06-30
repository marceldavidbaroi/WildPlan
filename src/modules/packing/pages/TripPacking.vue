<template>
  <q-page padding>
    <div v-if="!loading">
      <div class="row justify-end">
        <q-btn color="primary" flat icon="add" class="" @click="openAdd" />
      </div>
      <!-- Add mode -->
      <AddDialog
        :visible="showDialog"
        :trip-id="tripId"
        :owner-id="userId"
        :loading="false"
        :is-edit="isEdit"
        :itemToEdit="itemToEdit ?? null"
        @submit="handleAddItem"
        @update="handleUpdateItem"
        @close="handleClose"
      />

      <PackingItemCard
        :items="packingStore.items"
        :loading="packingStore.loading"
        @toggle-packed="togglePacked"
        @edit-item="openEdit"
        @delete-item="deleteItem"
      />

      <DeleteDialog
        v-model="showDeleteUserDialog"
        message="Are you sure you want to delete this packing item? This action cannot be undone."
        :loading="packingStore.loading"
        @confirm="confirmDeleteItem"
        @cancel="cancelDelete"
      />
    </div>
    <div v-else class="full-height flex flex-center">
      <q-spinner-ball color="primary" size="md" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import AddDialog from '../components/AddDialog.vue';
import PackingItemCard from '../components/PackingItemCard.vue';
import { onMounted, ref } from 'vue';
import { usePackingStore } from '../store';
import { useAuthStore } from 'src/modules/auth/store';
import type { PackingItemCreate, PackingItem, PackingFetchOptions } from '../store/types';
import { Notify } from 'quasar';
import DeleteDialog from 'src/components/DeleteDialog.vue';
const packingStore = usePackingStore();
const route = useRoute();
const tripId = ref();
const authStore = useAuthStore();
const userId = ref();
const options = ref<PackingFetchOptions>({
  tripId: '',
});
const loading = ref<boolean>(false);
const showDeleteUserDialog = ref<boolean>(false);
const deleteItemId = ref();
const showDialog = ref(false);
const isEdit = ref(false);
const itemToEdit = ref<PackingItem | null>(null);

onMounted(async () => {
  loading.value = true;
  userId.value = authStore.profile?.uid;
  tripId.value = route.params.id;
  options.value.tripId = tripId.value;
  await getAll();

  loading.value = false;
});

async function getAll() {
  const response = await packingStore.getPackingItems(options.value);
  return response;
}

async function handleAddItem(val: PackingItemCreate) {
  const response = await packingStore.addPackingItem(tripId.value, val);

  Notify.create({
    position: 'top',
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
  });

  if (response.success) {
    await getAll();
  }
}
async function togglePacked(val: PackingItem) {
  const response = await packingStore.togglePackedStatus(tripId.value, val.id, !val.isPacked);
  if (response.success) {
    await getAll();
  }
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });
}

function deleteItem(val: string) {
  deleteItemId.value = val;
  showDeleteUserDialog.value = true;
}

async function confirmDeleteItem() {
  const response = await packingStore.deletePackingItem(tripId.value, deleteItemId.value);
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });

  if (response.success) {
    await getAll();
  }

  showDeleteUserDialog.value = false;
}

function cancelDelete() {
  showDeleteUserDialog.value = false;
}

async function handleUpdateItem(val: PackingItem) {
  isEdit.value = false;
  const response = await packingStore.updatePackingItem(tripId.value, val.id, val);
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });

  if (response.success) {
    await getAll();
  }
}

function openAdd() {
  isEdit.value = false;
  itemToEdit.value = null;
  showDialog.value = true;
}

function openEdit(item: PackingItem) {
  isEdit.value = true;
  itemToEdit.value = item;
  showDialog.value = true;
}

function handleClose() {
  showDialog.value = false;
  isEdit.value = false;
  itemToEdit.value = null;
}
</script>

<style scoped></style>
