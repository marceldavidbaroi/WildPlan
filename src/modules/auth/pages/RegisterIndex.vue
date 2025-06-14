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

  <NotifyMessage :success="notifySuccess" :message="notifyMessage" v-if="showNotify" />
</template>

<script setup lang="ts">
import AuthCard from '../components/AuthCard.vue';
import FormRegister from '../components/FormRegister.vue';
import { ref } from 'vue';
import { useAuthStore } from '../store';
import NotifyMessage from 'src/components/NotifyMessage.vue';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const notifySuccess = ref(false);
const notifyMessage = ref('');
const showNotify = ref(false);

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
    notifySuccess.value = false;
    notifyMessage.value = "Passwords don't match.";
    showNotify.value = true;
    return;
  }

  const response = await authStore.registerWithEmail(email.value, password.value);
  notifySuccess.value = response.success;
  notifyMessage.value = response.message;
  showNotify.value = true;
};

function clearForm() {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
}

const handleSocialRegister = async () => {
  const response = await authStore.loginWithGoogle();
  notifySuccess.value = response.success;
  notifyMessage.value = response.message;
  showNotify.value = true;
};
</script>
