<template>
  <auth-card
    header-title="Register"
    primary-label="Sign Up"
    secondary-label="Clear"
    link="/auth/login"
    link-text="Already have an account? Log In"
    :social-logins="socialButtons"
    @primaryClick="handleRegister"
    @secondaryClick="clearForm"
    @socialClick="handleSocialRegister"
  >
    <template #fields>
      <FormRegister
        v-model:email="email"
        v-model:password="password"
        v-model:confirmPassword="confirmPassword"
      />
    </template>
  </auth-card>
</template>

<script setup lang="ts">
import AuthCard from '../components/AuthCard.vue';
import FormRegister from '../components/FormRegister.vue';
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { Notify } from 'quasar';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const socialButtons = [
  {
    label: 'Continue with Google',
    icon: 'fab fa-google',
    color: 'blue-grey-1',
    textColor: 'black',
    provider: 'google',
  },
];

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    Notify.create({
      message: "Passwords don't match.",
      type: 'info',
      color: 'negative',
      position: 'top',
    });

    return;
  }

  const response = await authStore.registerWithEmail(email.value, password.value);
  Notify.create({
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
    position: 'top',
  });
};

function clearForm() {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
}

const handleSocialRegister = async () => {
  const response = await authStore.loginWithGoogle();
  Notify.create({
    message: response.message,
    type: 'info',
    color: response.success ? 'info' : 'negative',
    position: 'top',
  });
};
</script>
