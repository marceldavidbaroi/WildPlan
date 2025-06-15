import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'dashboard',
        path: '',
        component: () => import('./pages/DashboardIndex.vue'),
      },
    ],
  },
];

export default authRoutes;
