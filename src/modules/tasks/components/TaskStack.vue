<template>
  <div class="my-card" style="width: 300px">
    <div v-for="(task, index) in tasks" :key="task.id">
      <div class="row">
        <q-card
          class="shadow-4 my-card"
          :class="{ expanded: expandedCard === index }"
          style="border-radius: 12px 12px 0 0"
          @click="toggleExpand(index)"
        >
          <q-card-section>
            <div v-if="expandedCard === index" class="row justify-between">
              <div>
                <q-btn
                  flat
                  dense
                  icon="person"
                  size="sm"
                  @click.stop="showAssignUser = !showAssignUser"
                >
                  <q-tooltip class="bg-info text-black">Assign User </q-tooltip>
                </q-btn>
                <q-btn
                  v-if="task.ownerId === authStore.profile!.uid"
                  flat
                  dense
                  icon="edit"
                  size="sm"
                  color="info"
                  @click.stop="showDialog = true"
                >
                  <q-tooltip class="bg-info text-black"> Edit Task </q-tooltip>
                </q-btn>
                <AddDialog v-model="showDialog" :is-edit="true" :task="task" @save="handleUpdate" />

                <q-btn
                  v-if="task.ownerId === authStore.profile!.uid"
                  flat
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click.stop="onDelete(task)"
                >
                  <q-tooltip class="bg-info text-black"> Delete Task </q-tooltip>
                </q-btn>
              </div>
              <div>
                <q-btn flat dense icon="close" size="sm" @click.stop="toggleExpand(index)" />
              </div>
            </div>
            <div class="row justify-between">
              <div>
                <q-badge :class="getPriorityColor(task.priority)" label="" />
                <span class="text-body1 text-bold q-px-sm">{{ task.title }}</span>
              </div>
              <div :class="calculateDueDateStatus(task.dueDate ?? '').statusColor">
                {{ calculateDueDateStatus(task.dueDate ?? '').status }}
              </div>
            </div>

            <!-- card expand -->
            <div v-if="expandedCard === index" class="full-content" @click.stop>
              <div v-if="task.assignedTo.length" class="row items-center q-gutter-sm q-my-sm">
                <q-avatar v-for="user in task.assignedTo" :key="user.email!" size="sm">
                  <q-img :src="user?.photoURL || ''" spinner-color="primary" spinner-size="20px" />
                  <q-tooltip>{{ user.displayName }}</q-tooltip>
                </q-avatar>
              </div>
              <div
                v-if="showAssignUser"
                class="shadow-4 q-pa-sm q-mb-md"
                style="border-radius: 12px"
              >
                <q-icon name="person" /> Assign user
                <q-select
                  v-model="task.assignedTo"
                  :options="users"
                  label="Standard"
                  filled
                  use-chips
                  dense
                  map-options
                  emit-value
                  option-label="email"
                  multiple
                  class="q-mt-sm"
                  @update:model-value="onMemberAdd(task)"
                />
              </div>
              <q-btn-dropdown
                :label="task.status ? formatStatus(task.status) : 'Select status'"
                :class="getStatusColor(task.status)"
                no-caps
                :loading="statusBtnLoading"
                dense
              >
                <q-list>
                  <q-item
                    v-for="status in statusOptions"
                    :key="status"
                    clickable
                    v-close-popup
                    @click="updateStatus(task, status)"
                  >
                    <q-item-section>{{ formatStatus(status) }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn-dropdown
                :label="task.priority ? formatPriority(task.priority) : 'Select priority'"
                :class="getPriorityColor(task.priority)"
                dense
                no-caps
                :loading="priorityBtnLoading"
                class="q-ml-sm"
              >
                <q-list>
                  <q-item
                    v-for="priority in priorityOptions"
                    :key="priority"
                    clickable
                    v-close-popup
                    @click="updatePriority(task, priority)"
                  >
                    <q-item-section>{{ formatPriority(priority) }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <!-- Example full content -->
              <div class="text-body1 q-py-lg">{{ task.description }}</div>
              <div class="row justify-end text-grey">
                Updated at: {{ new Date(task.updatedAt).toDateString() }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row">
      <q-card class="my-card shadow-4" style="border-radius: 12px 12px 0 0; height: 150px">
        <q-card-section>
          <div
            class="flex flex-center text-bold text-h4"
            style="border-radius: 12px; height: 100px"
            :class="getStatusColor(props.status)"
          >
            {{ props.status }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Task, TaskStatus, TaskPriority } from '../store/types';
import { useTaskStore } from '../store';
import { Notify } from 'quasar';
import AddDialog from './AddTask.vue';
import { useAuthStore } from 'src/modules/auth/store';

const authStore = useAuthStore();

const taskStore = useTaskStore();

const props = defineProps<{
  tasks: Task[];
  users: any;
  tripId: string;
  status: TaskStatus | any;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const statusOptions: TaskStatus[] = ['pending', 'inProgress', 'completed', 'cancelled'];
const priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

const expandedCard = ref<number | null>(null);
const showAssignUser = ref<boolean>(false);
const showDialog = ref<boolean>(false);

function toggleExpand(index: number) {
  expandedCard.value = expandedCard.value === index ? null : index;
}

function formatStatus(status: TaskStatus) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'inProgress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function getStatusColor(status: TaskStatus | undefined) {
  switch (status) {
    case 'pending':
      return 'status-soft-pending';
    case 'inProgress':
      return 'status-soft-in-progress';
    case 'completed':
      return 'status-soft-completed';
    case 'cancelled':
      return 'status-soft-cancelled';
    default:
      return 'status-soft-default';
  }
}

function formatPriority(priority: TaskPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getPriorityColor(priority: TaskPriority | undefined) {
  switch (priority) {
    case 'low':
      return 'priority-soft-low';
    case 'medium':
      return 'priority-soft-medium';
    case 'high':
      return 'priority-soft-high';
    default:
      return 'priority-soft-default';
  }
}

async function updateTask(task: Task) {
  const response = await taskStore.updateTask(props.tripId, task.id, task);

  console.log(response);
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });
}

const statusBtnLoading = ref(false);
async function updateStatus(task: Task, newStatus: TaskStatus) {
  statusBtnLoading.value = true;
  task.status = newStatus;
  await updateTask(task);
  statusBtnLoading.value = false;
}

const priorityBtnLoading = ref(false);
async function updatePriority(task: Task, newPriority: TaskPriority) {
  priorityBtnLoading.value = true;
  task.priority = newPriority;
  console.log(task);
  await updateTask(task);
  priorityBtnLoading.value = false;
}

// assign member to task
async function onMemberAdd(task: Task) {
  showAssignUser.value = false;
  console.log(task);

  await updateTask(task);
}

async function onDelete(task: Task) {
  console.log(task.id);
  const response = await taskStore.deleteTask(props.tripId, task.id);

  if (response.success) {
    emit('update');
  }
  Notify.create({
    position: 'top',
    message: response.message,
    color: response.success ? 'info' : 'negative',
    type: 'info',
  });
}
async function handleUpdate(task: Task) {
  console.log(task);
  showDialog.value = false;
  await updateTask(task);
}

function calculateDueDateStatus(dueDateStr: string) {
  // Parse the due date
  const dueDate = new Date(dueDateStr);

  // Today's date, normalized to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the difference in days
  const msPerDay = 1000 * 60 * 60 * 24;
  const delta = Math.floor((dueDate.getTime() - today.getTime()) / msPerDay);

  let status = '';
  let statusColor = '';

  if (delta > 0) {
    status = `${delta} day(s) left until due.`;
    statusColor = 'info';
  } else if (delta === 0) {
    status = 'Due today!';
    statusColor = 'text-info';
  } else {
    status = `Overdue by ${Math.abs(delta)} day(s).`;
    statusColor = 'text-negative';
  }

  return {
    dueDate: dueDate.toISOString().split('T')[0],
    today: today.toISOString().split('T')[0],
    status,
    statusColor,
  };
}
</script>

<style scoped>
.my-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
  min-width: 300px;
}

.my-card:hover {
  transform: translateY(-5px);
}

.my-card.expanded {
  position: relative;
  z-index: 10;
  transform: translateY(-10px) scale(1.05);
}

.full-content {
  margin-top: 12px;
}

/* Light Mode (default) */
.status-soft-pending {
  background-color: #607d8b; /* was color */
  color: #f0f4f8; /* was background */
}

.status-soft-in-progress {
  background-color: #1976d2;
  color: #e3f2fd;
}

.status-soft-completed {
  background-color: #388e3c;
  color: #e8f5e9;
}

.status-soft-cancelled {
  background-color: #d32f2f;
  color: #ffebee;
}

.status-soft-default {
  background-color: #455a64;
  color: #eceff1;
}

/* Dark Mode */
body.body--dark .status-soft-pending {
  background-color: #cfd8dc;
  color: #37474f;
}

body.body--dark .status-soft-in-progress {
  background-color: #90caf9;
  color: #263238;
}

body.body--dark .status-soft-completed {
  background-color: #c8e6c9;
  color: #1b5e20;
}

body.body--dark .status-soft-cancelled {
  background-color: #ffcdd2;
  color: #b71c1c;
}

body.body--dark .status-soft-default {
  background-color: #cfd8dc;
  color: #455a64;
}

/* Light Mode */
.priority-soft-low {
  background-color: #2e7d32; /* swapped */
  color: #e8f5e9;
}

.priority-soft-medium {
  background-color: #f9a825; /* swapped */
  color: #fff8e1;
}

.priority-soft-high {
  background-color: #c62828; /* swapped */
  color: #ffebee;
}

.priority-soft-default {
  background-color: #455a64; /* swapped */
  color: #eceff1;
}

/* Dark Mode */
body.body--dark .priority-soft-low {
  background-color: #c8e6c9; /* swapped */
  color: #1b5e20;
}

body.body--dark .priority-soft-medium {
  background-color: #fffde7; /* swapped */
  color: #f57f17;
}

body.body--dark .priority-soft-high {
  background-color: #ffcdd2; /* swapped */
  color: #b71c1c;
}

body.body--dark .priority-soft-default {
  background-color: #cfd8dc; /* swapped */
  color: #455a64;
}
</style>
