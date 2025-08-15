<template>
  <q-page padding class="q-pa-none">
    <div class="chat-layout row no-wrap">
      <!-- Sidebar -->
      <div class="sidebar column q-pa-md bg-grey-2">
        <h6>Chat List</h6>
        <q-list bordered padding>
          <q-item v-for="(item, index) in chatList" :key="index" clickable>
            <q-item-section>{{ item }}</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Chat Area -->
      <div class="chat-area column q-pa-md">
        <q-chat ref="chatRef" class="chat-container" style="height: 500px" dense flat>
          <q-chat-message
            v-for="(msg, index) in chatState.messages"
            :key="index"
            :sent="msg.role === 'user'"
            :text="[msg.content]"
            :name="msg.role === 'user' ? 'You' : 'Bot'"
            :avatar="
              msg.role === 'user' ? '' : 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'
            "
            :stamp="msg.time || ''"
            class="chat-message-wrap"
          />
        </q-chat>

        <!-- Input -->
        <div class="q-mt-md row items-center no-wrap">
          <q-input
            v-model="userMessage"
            label="Type your message"
            outlined
            dense
            class="flex-grow"
            @keyup.enter="handleSend"
          />
          <q-btn label="Send" color="primary" class="q-ml-sm" @click="handleSend" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { chatState, sendMessage } from '../store/action';
import { useAuthStore } from 'src/modules/auth/store';

const authStore = useAuthStore();
const token = ref<string | null>(null);
const sessionId = ref('');
const userMessage = ref('');
const chatRef = ref<any>(null);
const chatList = ref(['Chat 1', 'Chat 2', 'Chat 3']);

onMounted(async () => {
  const response = await authStore.getCurrentUserIdToken();
  token.value = response?.idToken || null;
});

async function handleSend() {
  if (!userMessage.value.trim()) return;

  const currentMessage = userMessage.value;
  userMessage.value = '';

  chatState.loading = true;
  chatState.error = null;

  try {
    const response = await sendMessage(sessionId.value, currentMessage, authStore.authToken);

    if (response?.session_id) sessionId.value = response.session_id;

    // Append bot reply as new message
    if (response?.reply) {
      chatState.messages.push({
        role: 'bot',
        content: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  } catch (err: any) {
    chatState.error = err.message || 'Failed to send message';
  } finally {
    chatState.loading = false;
    nextTick(() => chatRef.value?.scrollToBottom());
  }
}
</script>

<style scoped>
.chat-layout {
  height: 100%;
  min-height: 500px;
}

.sidebar {
  width: 200px;
  max-width: 200px;
  min-width: 150px;
}

.chat-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chat-container {
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #f7f7f8;
  padding: 12px;
  flex-grow: 1;
}

/* Ensure chat messages wrap and don't overflow */
.chat-message-wrap .q-chat-message__text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
