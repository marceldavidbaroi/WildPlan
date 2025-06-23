<template>
  <div class="q-pa-md">
    <div class="q-mb-md flex justify-end">
      <q-btn
        color="primary"
        icon="add"
        label="Add Administrator"
        @click="showDialog = true"
        class="q-mb-sm q-px-md"
        unelevated
      />
    </div>

    <q-table
      dense
      flat
      bordered
      class="q-table--responsive"
      :rows="rows"
      :columns="columns"
      row-key="email"
    >
      <!-- Avatar column -->
      <template v-slot:body-cell-photoURL="props">
        <q-td :props="props">
          <q-avatar size="40px" class="shadow-2">
            <img :src="props.row.photoURL" alt="avatar" />
          </q-avatar>
        </q-td>
      </template>

      <!-- Role chips -->
      <template v-slot:body-cell-role="props">
        <q-td :props="props">
          <div class="q-gutter-sm row wrap">
            <q-chip
              v-for="(role, index) in props.row.role"
              :key="index"
              removable
              color="primary"
              text-color="white"
              dense
              @remove="emitRoleRemove(props.row.uid, role)"
            >
              {{ role }}
            </q-chip>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog for assigning role -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="q-pa-md" style="min-width: 300px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Assign Administrator Role</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedUser"
            :options="involvedUsersOptions"
            label="Select a user"
            filled
            dense
            use-input
            map-options
            emit-value
            class="q-mb-md"
          />

          <q-option-group
            v-model="selectedRole"
            type="radio"
            :options="[
              { label: 'admin', value: 'admin' },
              { label: 'invitor', value: 'invitor' },
              { label: 'packingManager', value: 'packingManager' },
              { label: 'taskOrganizer', value: 'taskOrganizer' },
              { label: 'budgetOrganizer', value: 'budgetOrganizer' },
            ]"
            color="primary"
            class="q-gutter-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn unelevated label="Save" color="primary" @click="onSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/modules/auth/store';
import { ref, defineEmits, onMounted } from 'vue';
import { useTripStore } from '../store';
import { Notify } from 'quasar';
const authStore = useAuthStore();
const tripStore = useTripStore();
const props = defineProps<{
  rows: Array<any>;
  allUsers: Array<any>;
  involvedUsers: Array<any>;
}>();

const emit = defineEmits<{
  (e: 'update-role', payload: unknown): void | Promise<void>;
  (e: 'role-removed', payload: unknown): void | Promise<void>;
}>();

const showDialog = ref(false);
const selectedRole = ref('member');
const selectedUser = ref<string | null>(null);
const involvedUsersOptions = ref<{ label: string; value: string }[]>([]);

const columns = [
  {
    name: 'photoURL',
    label: 'photoURL',
    field: 'photoURL',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'displayName',
    label: 'displayName',
    field: 'displayName',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'email', label: 'email', field: 'email', align: 'left' as const, sortable: true },
  {
    name: 'role',
    label: 'role',
    field: (row: any) => row.role?.[0]?.children ?? '',
    align: 'left' as const,
    sortable: true,
  },
];

const emitRoleRemove = (id: string, role: Array<string>) => {
  // Emit a custom event (you can listen to it in parent with @role-removed)
  if (tripStore.activeTrip?.createdBy === id) {
    Notify.create({
      position: 'top',
      type: 'negative',
      message: 'You cannot remove the creator of the trip.',
    });
    return;
  }
  const val = {
    uid: id,
    role: role,
  };
  emit('role-removed', val);
};

onMounted(() => {
  involvedUsersOptions.value = props.involvedUsers.map((uid: string) => {
    const user = props.allUsers.find((u) => u.uid === uid);
    return {
      label: user?.email || 'Unknown User',
      value: user?.uid || uid,
    };
  });
});

function onSave() {
  emit('update-role', {
    uid: selectedUser.value,

    role: selectedRole.value,
  });
  showDialog.value = false;
}
</script>
