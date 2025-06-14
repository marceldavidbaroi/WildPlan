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
];

export default authRoutes;
