<template>
  <div class="q-pa-md row q-col-gutter-lg">
    <!-- Low Priority Column -->
    <div class="col-12 col-md-4">
      <div class="column-container">
        <div class="column-header bg-green-2 text-green-10">
          <q-icon name="trending_down" size="md" class="q-mr-sm" />
          Low Priority
        </div>

        <div v-for="task in tasksByPriority.low" :key="task.id" class="task-card">
          <q-card
            flat
            bordered
            class="hoverable-card"
            :class="getStatusColor(task.status)"
            @click="openTask(task)"
          >
            <q-card-section class="text-subtitle1 q-mb-xs">
              <div class="column">
                {{ task.title }}
                <q-chip
                  class="q-ma-none"
                  :class="calculateDueDateStatus(task.dueDate!).statusColor"
                  size="sm"
                  :label="calculateDueDateStatus(task.dueDate!).status"
                />
              </div>
              <div v-if="task?.assignedTo?.length" class="avatar-overlap">
                <q-avatar v-for="user in task.assignedTo" :key="user.id" size="xs">
                  <q-img :src="user.photoURL || ''" />
                  <q-tooltip>{{ user.displayName }}</q-tooltip>
                </q-avatar>
              </div>
            </q-card-section>
            <q-separator />
          </q-card>
        </div>
      </div>
    </div>

    <!-- Medium Priority Column -->
    <div class="col-12 col-md-4">
      <div class="column-container">
        <div class="column-header bg-orange-2 text-orange-10">
          <q-icon name="equalizer" size="md" class="q-mr-sm" />
          Medium Priority
        </div>

        <div v-for="task in tasksByPriority.medium" :key="task.id" class="task-card">
          <q-card
            flat
            bordered
            class="hoverable-card"
            :class="getStatusColor(task.status)"
            @click="openTask(task)"
          >
            <q-card-section class="text-subtitle1 q-mb-xs">
              <div class="column">
                {{ task.title }}
                <q-chip
                  class="q-ma-none"
                  :class="calculateDueDateStatus(task.dueDate!).statusColor"
                  size="sm"
                  :label="calculateDueDateStatus(task.dueDate!).status"
                />
              </div>
              <div v-if="task?.assignedTo?.length" class="avatar-overlap">
                <q-avatar v-for="user in task.assignedTo" :key="user.id" size="xs">
                  <q-img :src="user.photoURL || ''" />
                  <q-tooltip>{{ user.displayName }}</q-tooltip>
                </q-avatar>
              </div>
            </q-card-section>
            <q-separator />
          </q-card>
        </div>
      </div>
    </div>

    <!-- High Priority Column -->
    <div class="col-12 col-md-4">
      <div class="column-container">
        <div class="column-header bg-red-2 text-red-10">
          <q-icon name="trending_up" size="md" class="q-mr-sm" />
          High Priority
        </div>

        <div v-for="task in tasksByPriority.high" :key="task.id" class="task-card">
          <q-card
            flat
            bordered
            class="hoverable-card"
            :class="getStatusColor(task.status)"
            @click="openTask(task)"
          >
            <q-card-section class="text-subtitle1 q-mb-xs row justify-between">
              <div class="column">
                {{ task.title }}
                <q-chip
                  class="q-ma-none"
                  :class="calculateDueDateStatus(task.dueDate!).statusColor"
                  size="sm"
                  :label="calculateDueDateStatus(task.dueDate!).status"
                />
              </div>
              <div v-if="task?.assignedTo?.length" class="avatar-overlap">
                <q-avatar v-for="user in task.assignedTo" :key="user.id" size="xs">
                  <q-img :src="user.photoURL || ''" />
                  <q-tooltip>{{ user.displayName }}</q-tooltip>
                </q-avatar>
              </div>
            </q-card-section>
            <q-separator />
          </q-card>
        </div>
      </div>
    </div>

    <!-- Task Details Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section class="text-h6">
          {{ selectedTask?.title }}
          <q-btn-dropdown
            :label="selectedTask?.status ? formatStatus(selectedTask?.status) : 'Select status'"
            :class="getStatusColor(selectedTask?.status)"
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
                @click="updateStatus(selectedTask!, status)"
              >
                <q-item-section>{{ formatStatus(status) }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn-dropdown
            :label="
              selectedTask?.priority ? formatPriority(selectedTask?.priority!) : 'Select priority'
            "
            :class="getPriorityColor(selectedTask?.priority)"
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
                @click="updatePriority(selectedTask!, priority)"
              >
                <q-item-section>{{ formatPriority(priority) }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div><strong>Description:</strong> {{ selectedTask?.description || 'N/A' }}</div>
          <div class="q-mt-md"><strong>Due Date:</strong> {{ selectedTask?.dueDate }}</div>
          <div class="q-mt-md">
            <strong>Assigned To:</strong>
            <div v-if="selectedTask?.assignedTo?.length">
              <q-avatar
                v-for="user in selectedTask.assignedTo"
                :key="user.id"
                size="md"
                class="q-mr-sm"
              >
                <q-img :src="user.photoURL || ''" />
                <q-tooltip>{{ user.displayName }}</q-tooltip>
              </q-avatar>
            </div>
            <div v-else>No user assigned</div>
          </div>
          <div class="q-mt-md"><strong>Status:</strong> {{ selectedTask?.status }}</div>
          <div class="q-mt-md"><strong>Priority:</strong> {{ selectedTask?.priority }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Task, TaskStatus, TaskPriority } from '../store/types';
import { useTaskStore } from '../store';
import { Notify } from 'quasar';

const taskStore = useTaskStore();

const props = defineProps<{
  tasks: Task[];
  tripId: string;
}>();

const statusOptions: TaskStatus[] = ['pending', 'inProgress', 'completed', 'cancelled'];
const priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

const tasksByPriority = computed(() => ({
  low: props.tasks.filter((task) => task.priority === 'low'),
  medium: props.tasks.filter((task) => task.priority === 'medium'),
  high: props.tasks.filter((task) => task.priority === 'high'),
}));

const showDialog = ref(false);
const selectedTask = ref<Task | null>(null);

function openTask(task: Task) {
  selectedTask.value = task;
  showDialog.value = true;
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
.column-container {
  display: flex;
  flex-direction: column;
}

.column-header {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.task-card {
  margin-bottom: 12px;
}

.hoverable-card {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  cursor: pointer;
}

.hoverable-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
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

.avatar-overlap ::v-deep(q-avatar) {
  margin-right: -8px !important; /* negative margin to overlap */
  border: 2px solid white !important; /* optional border to separate */
  box-sizing: content-box !important;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.avatar-overlap ::v-deep(q-avatar):hover {
  z-index: 10 !important; /* bring hovered avatar to front */
}

.avatar-overlap ::v-deep(q-avatar):not(:last-child) {
  z-index: 2 !important; /* stacking order */
}
</style>
