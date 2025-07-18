<template>
  <q-page padding>
    <q-input
      v-model="sessionId"
      label="Session ID"
      dense
      outlined
      class="q-mb-md"
    />

    <div
      ref="chatWindow"
      class="chat-window q-pa-md q-mb-md"
    >
      <div
        v-for="(msg, i) in chatState.messages"
        :key="i"
        :class="[
          'chat-message',
          msg.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <q-chip
          :color="msg.role === 'user' ? 'primary' : 'grey-4'"
          text-color="black"
          outline
          class="chat-bubble"
        >
          <strong>{{ msg.role }}:</strong> {{ msg.content }}
        </q-chip>
      </div>

      <div v-if="chatState.loading" class="text-grey-6 q-mt-sm">Typing...</div>
      <div v-if="chatState.error" class="text-negative q-mt-md">
        {{ chatState.error }}
      </div>
    </div>

    <q-input
      v-model="userMessage"
      label="Your message"
      outlined
      dense
      @keyup.enter="handleSend"
      :disable="!sessionId || chatState.loading"
      autofocus
    />

    <q-btn
      label="Send"
      color="primary"
      class="q-ml-sm"
      @click="handleSend"
      :disable="!sessionId || !userMessage || chatState.loading"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watchEffect, nextTick, onMounted } from 'vue';
import { chatState, sendMessage, resetChat } from '../store/action';
import { useAuthStore } from 'src/modules/auth/store';

const authStore = useAuthStore();
const token = ref(null);

onMounted(async () => {
  const response = await authStore.getCurrentUserIdToken();
  token.value = response?.idToken;
  console.log(response?.idToken);
});

const sessionId = ref('mychat123');
const userMessage = ref('');
const chatWindow = ref(null);

function scrollToBottom() {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
}

watchEffect(() => {
  scrollToBottom();
});

async function handleSend() {
  if (!userMessage.value.trim()) return;

  await sendMessage(sessionId.value, userMessage.value, token.value, {
    location: 'San Francisco',
    mood: 'friendly',
    style: 'casual',
  });

  userMessage.value = '';
}
</script>

<style scoped>
.chat-window {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.chat-message {
  display: flex;
  margin-bottom: 6px;
}

.chat-bubble {
  max-width: 70%;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
