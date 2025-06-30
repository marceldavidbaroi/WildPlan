<template>
  <q-page padding>
    <div v-if="!loading">
      <div class="row justify-end">
        <q-btn color="primary" flat icon="add" class="" @click="openAdd" />
      </div>

      <!-- filter options -->
      <div class="row q-gutter-sm">
        <div class="col-12 col-sm-4 col-md-2">
          <q-select
            v-model="options.category"
            :options="categoryOptions"
            label="Category"
            emit-value
            map-options
            outlined
            dense
            @update:model-value="getAll"
          />
        </div>
        <div class="col-12 col-sm-4 col-md-2">
          <q-select
            v-model="options.type"
            :options="typeOption"
            label="Type"
            emit-value
            map-options
            outlined
            dense
            @update:model-value="getAll"
          />
        </div>
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
        :uid="authStore.profile!.uid"
        @toggle-packed="togglePacked"
        @edit-item="openEdit"
        @delete-item="deleteItem"
        @add-item="addItemForUser"
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
import type {
  PackingItemCreate,
  PackingItem,
  PackingFetchOptions,
  PackingCategory,
  PackingType,
  PackedStatus,
} from '../store/types';
import { Notify } from 'quasar';
import DeleteDialog from 'src/components/DeleteDialog.vue';
const packingStore = usePackingStore();
const route = useRoute();
const tripId = ref();
const authStore = useAuthStore();
const userId = ref();
const options = ref<PackingFetchOptions>({
  tripId: '',
  type: null,
  category: null,
  packedStatus: null,
});
const loading = ref<boolean>(false);
const showDeleteUserDialog = ref<boolean>(false);
const deleteItemId = ref();
const showDialog = ref(false);
const isEdit = ref(false);
const itemToEdit = ref<PackingItem | null>(null);

const categoryOptions: { label: string; value: PackingCategory | null }[] = [
  { label: 'All', value: null },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Food', value: 'food' },
  { label: 'Camping Gear', value: 'campingGear' },
  { label: 'Cooking', value: 'cooking' },
  { label: 'Safety', value: 'safety' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Personal Care', value: 'personalCare' },
  { label: 'Miscellaneous', value: 'misc' },
];

const typeOption: { label: string; value: PackingType | null }[] = [
  { label: 'All', value: null },
  { label: 'Personal', value: 'personal' },
  { label: 'Shared', value: 'shared' },
];

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
  if (val.type === 'personal') {
    val.isPacked = false;
  } else {
    val.isPacked = [{ uid: authStore.profile!.uid, state: false }];
  }

  console.log(val);

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
  let response;
  if (val.type === 'personal') {
    response = await packingStore.togglePackedStatus(tripId.value, val.id, !val.isPacked);
  } else {
    if (Array.isArray(val.isPacked)) {
      const userStatus = val.isPacked.find((u) => u.uid === authStore.profile!.uid);
      if (userStatus) {
        userStatus.state = !userStatus.state;
      }
      response = await packingStore.updatePackingItem(tripId.value, val.id, val);
    }
  }

  if (response?.success) {
    await getAll();
  }
  Notify.create({
    position: 'top',
    message: response!.message,
    color: response!.success ? 'info' : 'negative',
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

async function addItemForUser(item: PackingItem) {
  if (Array.isArray(item.isPacked)) {
    item.isPacked.push({ uid: authStore.profile!.uid, state: false });
  }
  console.log('updated', item);

  const response = await packingStore.updatePackingItem(tripId.value, item.id, item);
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
</script>

<style scoped></style>
