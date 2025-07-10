import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('./pages/LoginIndex.vue'),
      },
      {
        name: 'profile',
        path: 'profile',
        component: () => import('./pages/ProfileIndex.vue'),
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('./pages/RegisterIndex.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        meta: { requiresAuth: true },
        name: 'user_settings',
        path: 'settings',

        component: () => import('./pages/UserSettings.vue'),
      },
      {
        name: 'logout',
        path: 'logout',
        component: () => import('./pages/LogoutIndex.vue'),
      },
    ],
  },
];

export default authRoutes;
