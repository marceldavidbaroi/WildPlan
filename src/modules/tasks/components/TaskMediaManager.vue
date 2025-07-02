<template>
  <div class="">
    <!-- pending -->
    <div class="" style="border: 1px solid red">
      <TaskStack
        v-if="pendingTasks.length"
        status="pending"
        :tasks="pendingTasks ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- in progress -->
    <TaskStack
      v-if="inProgressTasks.length"
      status="inProgress"
      :tasks="inProgressTasks ?? []"
      :users="users"
      :tripId="tripId"
      @update="emit('update')"
    />
    <!-- completed -->
    <TaskStack
      v-if="completedTasks.length"
      status="completed"
      :tasks="completedTasks ?? []"
      :users="users"
      :tripId="tripId"
      @update="emit('update')"
    />
    <!-- cancelled -->
    <TaskStack
      v-if="cancelledTasks.length"
      status="cancelled"
      :tasks="cancelledTasks ?? []"
      :users="users"
      :tripId="tripId"
      @update="emit('update')"
    />
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

// Grouped computed arrays
const pendingTasks = computed(() => props.tasks.filter((task) => task.status === 'pending'));

const inProgressTasks = computed(() => props.tasks.filter((task) => task.status === 'inProgress'));

const completedTasks = computed(() => props.tasks.filter((task) => task.status === 'completed'));

// If you want cancelled too:
const cancelledTasks = computed(() => props.tasks.filter((task) => task.status === 'cancelled'));
</script>

<style scoped></style>
