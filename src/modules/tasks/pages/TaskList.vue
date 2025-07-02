<template>
  <q-page padding>
    <q-btn label="Add Task" color="primary" icon="add" @click="showDialog = true" />
    <AddDialog v-model="showDialog" @save="handleSave" />

    <div class="q-mt-xl">
      <TaskMediaManager :tasks="taskStore.tasks" :users="users" :trip-id="tripId" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Task, TaskFetchOptions } from '../store/types';
import { useTaskStore } from '../store';
import { useAuthStore } from 'src/modules/auth/store';
import { useTripStore } from 'src/modules/trip/store';
import { Notify } from 'quasar';
import AddDialog from '../components/AddTask.vue';
import TaskMediaManager from '../components/TaskMediaManager.vue';

const tripStore = useTripStore();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const route = useRoute();
const tripId = ref();
const showDialog = ref<boolean>(false);
const users = ref();
const option = ref<TaskFetchOptions>({});

onMounted(async () => {
  tripId.value = route.params.id ?? '';
  option.value.tripId = tripId.value;
  await getAll();
  await authStore.fetchAllUser();
  await tripStore.fetchTrip(tripId.value);

  users.value = authStore.allUsers?.filter((user) =>
    tripStore.activeTrip?.members.includes(user.uid),
  );
});

async function getAll() {
  await taskStore.getTasks(option.value);
}
async function handleSave(task: Task) {
  task.tripId = tripId.value;
  task.ownerId = authStore.profile!.uid;
  const response = await taskStore.addTask(tripId.value, task);
  if (response.success) {
    await getAll();
  }
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });
  console.log('Saved Task:', task);
  // Add your save logic here
}
</script>

<style scoped></style>
