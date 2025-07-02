<template>
  <div class="row q-gutter-md">
    <!-- unassigned task -->
    <div v-if="unAssignedTask.length" class="">
      <TaskStack
        status="Unassigned"
        :tasks="unAssignedTask ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- pending -->
    <div v-if="pendingTasks.length" class="">
      <TaskStack
        status="pending"
        :tasks="pendingTasks ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- in progress -->
    <div v-if="inProgressTasks.length" class="">
      <TaskStack
        status="inProgress"
        :tasks="inProgressTasks ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- completed -->
    <div v-if="completedTasks.length" class="">
      <TaskStack
        status="completed"
        :tasks="completedTasks ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- cancelled -->
    <div v-if="cancelledTasks.length" class="">
      <TaskStack
        status="cancelled"
        :tasks="cancelledTasks ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TaskStack from './TaskStack.vue';
import type { Task } from '../store/types';
const props = defineProps<{
  tasks: Task[]; // optional task to edit
  users: any;
  tripId: string; // optional task to edit
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const assignedTask = computed(() => props.tasks.filter((task) => task.assignedTo.length !== 0));
const unAssignedTask = computed(() => props.tasks.filter((task) => task.assignedTo.length === 0));
// Grouped computed arrays
const pendingTasks = computed(() => assignedTask.value.filter((task) => task.status === 'pending'));

const inProgressTasks = computed(() =>
  assignedTask.value.filter((task) => task.status === 'inProgress'),
);

const completedTasks = computed(() =>
  assignedTask.value.filter((task) => task.status === 'completed'),
);

// If you want cancelled too:
const cancelledTasks = computed(() =>
  assignedTask.value.filter((task) => task.status === 'cancelled'),
);
</script>

<style scoped></style>
