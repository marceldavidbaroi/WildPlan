<template>
  <q-dialog v-model="show" persistent>
    <q-card class="flex flex-col" :class="['chat-widget', $q.dark.isActive ? 'dark' : 'light']">
      <!-- Header -->
      <q-card-section class="row items-center justify-between header">
        <div class="text-subtitle1">AI Assistant</div>
        <q-btn flat dense icon="close" size="sm" @click="show = false" />
      </q-card-section>

      <!-- Chat Body -->
      <q-card-section class="col overflow-auto chat-body" ref="chatWindow">
        <div v-for="(msg, index) in messages" :key="index" :class="['bubble', msg.role]">
          <div>{{ msg.content }}</div>
        </div>

        <div v-if="loading" class="bubble assistant">
          <div>{{ aiTyping }}</div>
        </div>
      </q-card-section>

      <!-- Input -->
      <q-separator />
      <q-card-actions class="input-bar">
        <q-input
          v-model="input"
          placeholder="Type something..."
          dense
          filled
          borderless
          class="col-grow"
          @keyup.enter="sendMessage"
        />
        <q-btn icon="send" round flat :disable="!input.trim() || loading" @click="sendMessage" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Floating Button -->
  <q-btn
    v-if="!show"
    icon="chat"
    round
    size="md"
    color="primary"
    class="fixed-btn"
    @click="show = true"
  />
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const show = ref(false);
const input = ref('');
const messages = ref<{ role: string; content: string }[]>([]);
const loading = ref(false);
const aiTyping = ref('');
const chatWindow = ref<HTMLDivElement>();

async function sendMessage() {
  if (!input.value.trim()) return;

  messages.value.push({ role: 'user', content: input.value.trim() });
  const prompt = input.value.trim();
  input.value = '';
  loading.value = true;
  aiTyping.value = '';

  const reply = await askAI(prompt);
  await typeAI(reply);

  messages.value.push({ role: 'assistant', content: reply });
  loading.value = false;
  aiTyping.value = '';

  scrollToBottom();
}

async function typeAI(text: string) {
  for (let i = 0; i <= text.length; i++) {
    aiTyping.value = text.slice(0, i);
    await new Promise((r) => setTimeout(r, 15));
    scrollToBottom();
  }
}

async function askAI(prompt: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response || 'Sorry, I have no answer.';
}

function scrollToBottom() {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.chat-widget {
  width: 320px;
  max-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
}

.chat-widget.light {
  background: #ffffff;
  color: #222;
}

.chat-widget.dark {
  background: #1e1e1e;
  color: #ddd;
}

.header {
  background: var(--q-primary);
  color: #fff;
  padding: 0.5rem 1rem;
}

.chat-body {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.bubble {
  max-width: 75%;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
  word-break: break-word;
  font-size: 0.85rem;
  line-height: 1.4;
}

.bubble.user {
  align-self: flex-end;
  background: #007bff;
  color: #fff;
}

.bubble.assistant {
  align-self: flex-start;
  background: #e0e0e0;
  color: #222;
}

.dark .bubble.assistant {
  background: #333;
  color: #eee;
}

.input-bar {
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.fixed-btn {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1000;
}
</style>
