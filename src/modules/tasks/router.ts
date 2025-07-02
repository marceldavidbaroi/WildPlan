import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/tasks',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'tasks',
        path: '',
        component: () => import('./pages/TaskIndex.vue'),
      },
    ],
  },
];

export default authRoutes;
