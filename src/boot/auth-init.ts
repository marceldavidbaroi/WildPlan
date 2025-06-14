import { useAuthStore } from 'src/modules/auth/store';

export default () => {
  const authStore = useAuthStore();
  authStore.initAuth();
};
