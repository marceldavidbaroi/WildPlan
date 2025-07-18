import { reactive } from 'vue';
import { sendChatMessage } from '../services/ai.service';

export const chatState = reactive({
  messages: [],
  loading: false,
  error: null,
});

export async function sendMessage(sessionId, userMessage, token, extraPayload = {}) {
  console.log('token form the action ',token)
  chatState.error = null;
  chatState.loading = true;

  // Add user message
  chatState.messages.push({ role: 'user', content: userMessage });

  let aiResponse = '';

  try {
    await sendChatMessage(
      sessionId,
      { message: userMessage, ...extraPayload },
      token,
      (chunk) => {
        aiResponse += chunk;

        // Add or update assistant message
        const lastAssistantIndex = chatState.messages.findIndex(m => m.role === 'assistant');
        if (lastAssistantIndex === -1 || chatState.messages[lastAssistantIndex].content === '') {
          chatState.messages.push({ role: 'assistant', content: aiResponse });
        } else {
          chatState.messages[lastAssistantIndex].content = aiResponse;
        }
      }
    );
  } catch (err) {
    chatState.error = err.message || 'Unknown error';
  } finally {
    chatState.loading = false;
  }
}

export function resetChat() {
  chatState.messages = [];
  chatState.error = null;
  chatState.loading = false;
}
