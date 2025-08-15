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
  const res = await fetch('http://localhost:8000/chat/87d97518-f313-4695-83f8-32cc5a65f330', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiN2JhZmIyZjEwY2FlMmIxZjA3ZjM4MTZjNTQyMmJlY2NhNWMyMjMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWthc2ggRGF2aWQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTFJBR2QzdlZiN1ZBMWI5RzdZTGRUYy10a1VVeGJxYmxGaTkwdnpkZFp6bG1XS2F3PXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3dpbGRwbGFuLWVlMDQwIiwiYXVkIjoid2lsZHBsYW4tZWUwNDAiLCJhdXRoX3RpbWUiOjE3NTUxNTk4MzksInVzZXJfaWQiOiJ2d2Q4Q3cyb1djT1daVXBwbGVDS05CTldkUXcxIiwic3ViIjoidndkOEN3Mm9XY09XWlVwcGxlQ0tOQk5XZFF3MSIsImlhdCI6MTc1NTI0ODI2NywiZXhwIjoxNzU1MjUxODY3LCJlbWFpbCI6ImFrYXNoZGF2aWQyMDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTE1NzI5NDQyMjk2Mjc5MDE4MDQxIl0sImVtYWlsIjpbImFrYXNoZGF2aWQyMDAwQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.YnfOpllsvWY5RUE02waIi6x8rndab1tN3TTXdJj9IvwrtIOAFq6QUohUcpxBne9ukvw3lQb1lzWOkRH4pytagLP6DiTDhUOnCJ3bgMo7co4c7_MTimdfKeystCDD3WyVdVIhasJFkcvYx1BGYucK_HcJKDa9jRzHxBAs50gKTM8fDDxjwwrb94W_24837Lq-QPSzXpZ1CB7IS3CGYnc95_Y-Gc5fpHsZrAmzT72d0Vi3mniRBB7wFwPcS3BCc4kbTGslkwBhjw18CTmWQSFpR_xHl4iEu6s0q0fNri-12NlApTZGbxoKePv74M6_KROsIZRJDv-uqWQVZ4ATJ0h05w',
    },
    body: JSON.stringify({
      message: prompt,
    }),
  });

  const data = await res.json();
  return data.reply;
}
// async function askAI(prompt: string) {
//   const response = await fetch('http://localhost:11434/api/generate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: 'phi3',
//       prompt,
//       stream: false,
//     }),
//   });
//   const data = await response.json();
//   return data.response || 'Sorry, I have no answer.';
// }

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
