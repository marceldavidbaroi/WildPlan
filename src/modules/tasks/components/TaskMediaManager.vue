<template>
  <q-btn-group flat class="q-mb-lg">
    <q-btn
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      no-caps
      :color="selected === option.value ? 'primary' : ''"
      unelevated
      @click="selectOption(option.value)"
    />
  </q-btn-group>

  <!-- my task -->
  <div v-if="selected === 'my'" class="row q-gutter-md">
    <!-- unassigned task -->

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
  </div>

  <!-- created by me  -->
  <div v-if="selected === 'created'" class="row q-gutter-md">
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
    <div v-if="pendingTasksByMe.length" class="">
      <TaskStack
        status="pending"
        :tasks="pendingTasksByMe ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- in progress -->
    <div v-if="inProgressTasksByMe.length" class="">
      <TaskStack
        status="inProgress"
        :tasks="inProgressTasksByMe ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- completed -->
    <div v-if="completedTasksByMe.length" class="">
      <TaskStack
        status="completed"
        :tasks="completedTasksByMe ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
    <!-- cancelled -->
    <div v-if="cancelledTasksByMe.length" class="">
      <TaskStack
        status="cancelled"
        :tasks="cancelledTasksByMe ?? []"
        :users="users"
        :tripId="tripId"
        @update="emit('update')"
      />
    </div>
  </div>

  <div v-if="selected === 'all'">
    <TaskTableView :tasks="tasks" :tripId="tripId" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TaskStack from './TaskStack.vue';
import type { Task } from '../store/types';
import TaskTableView from './TaskTableView.vue';
const props = defineProps<{
  tasks: Task[]; // optional task to edit
  users: object;
  tripId: string; // optional task to edit
  uid: string;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const options = [
  { label: 'My Tasks', value: 'my' },
  { label: 'Created By Me', value: 'created' },
  { label: 'All Tasks', value: 'all' },
];

const selected = ref('my');

function selectOption(value: string) {
  selected.value = value;
  // Add your logic here: e.g., emit an event or fetch tasks
  console.log('Selected:', value);
}

const unAssignedTask = computed(() =>
  props.tasks.filter((task) => task.assignedTo.length === 0 && task.ownerId === props.uid),
);
const assignedTaskByMe = computed(() =>
  props.tasks.filter((task) => task.assignedTo.length !== 0 && task.ownerId === props.uid),
);
const pendingTasksByMe = computed(() =>
  assignedTaskByMe.value.filter((task) => task.status === 'pending'),
);

const inProgressTasksByMe = computed(() =>
  assignedTaskByMe.value.filter((task) => task.status === 'inProgress'),
);

const completedTasksByMe = computed(() =>
  assignedTaskByMe.value.filter((task) => task.status === 'completed'),
);

// If you want cancelled too:
const cancelledTasksByMe = computed(() =>
  assignedTaskByMe.value.filter((task) => task.status === 'cancelled'),
);

//assigned task to me
const assignedTask = computed(() =>
  props.tasks.filter(
    (task) =>
      task.assignedTo.length !== 0 && task.assignedTo.some((assignee) => assignee.id === props.uid),
  ),
);
const pendingTasks = computed(() => assignedTask.value.filter((task) => task.status === 'pending'));
const inProgressTasks = computed(() =>
  assignedTask.value.filter((task) => task.status === 'inProgress'),
);

const completedTasks = computed(() =>
  assignedTask.value.filter((task) => task.status === 'completed'),
);
</script>

<style scoped></style>
