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
                />
                <q-btn flat dense icon="edit" size="sm" @click.stop="onEdit(index)" />
                <q-btn flat dense icon="delete" size="sm" @click.stop="onDelete(task)" />
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
              <div>{{ task.dueDate }}</div>
            </div>
            <div v-if="expandedCard === index" class="full-content" @click.stop>
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
                />
                <div class="row justify-end">
                  <q-btn
                    color="primary"
                    dense
                    size="sm"
                    label="save"
                    class="q-mt-md"
                    @click="onMemberAdd(task)"
                  />
                </div>
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
const assignedUsers = ref([]);

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
  background-color: #f0f4f8;
  color: #607d8b;
}

.status-soft-in-progress {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-soft-completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-soft-cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.status-soft-default {
  background-color: #eceff1;
  color: #455a64;
}

/* Dark Mode */
body.body--dark .status-soft-pending {
  background-color: #37474f;
  color: #cfd8dc;
}

body.body--dark .status-soft-in-progress {
  background-color: #263238;
  color: #90caf9;
}

body.body--dark .status-soft-completed {
  background-color: #1b5e20;
  color: #c8e6c9;
}

body.body--dark .status-soft-cancelled {
  background-color: #b71c1c;
  color: #ffcdd2;
}

body.body--dark .status-soft-default {
  background-color: #455a64;
  color: #cfd8dc;
}

/* Light Mode */
.priority-soft-low {
  background-color: #e8f5e9; /* soft green */
  color: #2e7d32;
}

.priority-soft-medium {
  background-color: #fff8e1; /* soft yellow */
  color: #f9a825;
}

.priority-soft-high {
  background-color: #ffebee; /* soft red */
  color: #c62828;
}

.priority-soft-default {
  background-color: #eceff1;
  color: #455a64;
}

/* Dark Mode */
body.body--dark .priority-soft-low {
  background-color: #1b5e20;
  color: #c8e6c9;
}

body.body--dark .priority-soft-medium {
  background-color: #f57f17;
  color: #fffde7;
}

body.body--dark .priority-soft-high {
  background-color: #b71c1c;
  color: #ffcdd2;
}

body.body--dark .priority-soft-default {
  background-color: #455a64;
  color: #cfd8dc;
}
</style>
