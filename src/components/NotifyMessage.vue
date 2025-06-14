<script setup lang="ts">
import { defineProps, watch } from 'vue';
import { Notify } from 'quasar';

interface Props {
  success: boolean;
  message: string;
}

const props = defineProps<Props>();

// Show notify when props.message changes
watch(
  () => [props.success, props.message],
  ([success, message]) => {
    if (!message || typeof message !== 'string') return;

    Notify.create({
      position: 'top',
      color: success ? 'green' : 'red',
      textColor: 'white',
      message,
      icon: success ? 'check_circle' : 'error',
      timeout: 5000,
      // Remove closeBtn: true,
      actions: [
        {
          icon: 'close', // icon button instead of text label
          color: 'white',
          handler: () => {
            /* closes notification automatically */
          },
        },
      ],
      multiLine: false,
      closeBtn: false,
    });
  },
  { immediate: true },
);
</script>
