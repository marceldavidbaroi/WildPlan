<template>
  <auth-card
    header-title="Login"
    primary-label="Log In"
    secondary-label="Clear"
    link="/auth/register"
    link-text="Don't have an account? Register"
    :social-logins="socialButtons"
    @primaryClick="handleLogin"
    @secondaryClick="clearForm"
    @socialClick="handleSocialLogin"
  >
    <template #fields>
      <form-login v-model:email="email" v-model:password="password" />
    </template>
  </auth-card>

  <NotifyMessage :success="notifySuccess" :message="notifyMessage" v-if="showNotify" />
</template>

<script setup lang="ts">
import AuthCard from '../components/AuthCard.vue';
import FormLogin from '../components/FormLogin.vue';
import { ref } from 'vue';
import { useAuthStore } from '../store';
import NotifyMessage from 'src/components/NotifyMessage.vue';
import { useRouter } from 'vue-router';
const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
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

const handleLogin = async () => {
  const response = await authStore.loginWithEmail(email.value, password.value);
  console.log(response);
  notifySuccess.value = response.success;
  notifyMessage.value = response.message;
  showNotify.value = true;
};

function clearForm() {
  email.value = '';
  password.value = '';
}

const handleSocialLogin = async () => {
  const response = await authStore.loginWithGoogle();
  notifySuccess.value = response.success;
  notifyMessage.value = response.message;
  showNotify.value = true;
  if (response.success) {
    await router.push({ name: 'dashboard' });
  }
  // you can now call your Firebase or OAuth method here
};
</script>
