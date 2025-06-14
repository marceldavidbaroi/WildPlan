<template>
  <q-page class="full-width full-height flex flex-center" padding>
    <q-card
      class="glass-card q-mx-auto"
      :class="$q.screen.gt.xs ? 'q-pa-lg' : 'q-px-sm q-py-md'"
      :style="$q.screen.gt.xs ? 'width: 500px' : 'width: 100%'"
    >
      <q-card-section class="text-h5 text-center text-weight-bold text-white">
        {{ headerTitle }}
      </q-card-section>
      <q-card-section>
        <slot name="fields" />
      </q-card-section>
      <q-card-actions vertical class="row q-gutter-sm q-mt-md">
        <q-btn
          :label="primaryLabel"
          color="primary"
          @click="emit('primaryClick')"
          unelevated
          class=""
        />

        <q-btn
          :label="secondaryLabel"
          color="secondary"
          flat
          @click="emit('secondaryClick')"
          class=""
        />
      </q-card-actions>
      <!-- Social Login Buttons -->
      <q-card-section v-if="socialLogins?.length" class="q-mt-md">
        <div class="q-mb-sm text-center text-caption">Or continue with</div>
        <q-btn
          v-for="btn in socialLogins"
          :key="btn.provider"
          :label="btn.label"
          :icon="btn.icon"
          :color="btn.color"
          outline
          class="full-width q-mb-sm"
          @click="emit('socialClick', btn.provider)"
        />
      </q-card-section>
      <!-- Bottom Link -->
      <q-card-section class="text-center q-mt-sm">
        <q-btn
          v-if="link && linkText"
          :label="linkText"
          :to="link"
          flat
          dense
          color="white"
          class="text-caption"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

type SocialLogin = {
  label: string;
  icon: string;
  color: string;
  provider: string;
};

defineProps<{
  headerTitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  link?: string;
  linkText?: string;
  socialLogins?: SocialLogin[];
}>();

const emit = defineEmits<{
  (e: 'primaryClick'): void;
  (e: 'secondaryClick'): void;
  (e: 'socialClick', provider: string): void;
}>();
</script>

<style scoped>
.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  color: #fff;
}
</style>
