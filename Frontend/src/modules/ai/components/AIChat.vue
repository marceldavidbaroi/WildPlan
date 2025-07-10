<template>
  <div>
    <div v-for="msg in aiStore.messages" :key="msg.text">
      <strong>{{ msg.role }}:</strong> {{ msg.text }}
    </div>

    <input v-model="input" @keyup.enter="send" placeholder="Type here..." />
    <button @click="send" :disabled="aiStore.loading">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAIStore } from '../store';

const aiStore = useAIStore();
const input = ref('');

function send() {
  if (input.value.trim()) {
    aiStore.sendMessage(input.value.trim());
    input.value = '';
  }
}
</script>
