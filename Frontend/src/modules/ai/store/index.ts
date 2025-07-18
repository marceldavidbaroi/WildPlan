import { defineStore } from 'pinia';
import apiAI from 'boot/ai';

export const useAIStore = defineStore('ai', {
  state: () => ({
    messages: [],
    loading: false,
  }),
  actions: {
    async sendMessage(userMessage) {
      this.loading = true;
      this.messages.push({ role: 'user', text: userMessage });

      try {
        const res = await apiAI.post('/chat', { prompt: userMessage });
        this.messages.push({ role: 'assistant', text: res.data.reply });
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
