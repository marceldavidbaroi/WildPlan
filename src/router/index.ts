import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from 'src/modules/auth/store';
import auth from 'src/modules/auth/router';
import dashboard from 'src/modules/dashboard/router';
import trip from 'src/modules/trip/router';

const routes: RouteRecordRaw[] = [
  ...auth,
  ...dashboard,
  ...trip,

  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('src/components/UnauthenticatedPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    name: 'ErrorNotFound',
    component: () => import('src/components/PageNotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Global route guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // if (!authStore.initialized) {
  //   authStore.initAuth(); // ensure initAuth resolves before continuing
  // }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // ❌ Redirect to unauthorized instead of login
    return next({ path: '/unauthorized' });
  }

  next();
});

export default router;
