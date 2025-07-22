import { useAuthStore } from 'src/modules/auth/store';

export default async () => {
  const authStore = useAuthStore();
  await authStore.initAuth();
  await authStore.getUserIdToken()
};
