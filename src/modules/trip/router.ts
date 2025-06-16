import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/trip',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'trip',
        path: '',
        component: () => import('./pages/TripListIndex.vue'),
      },
    ],
  },
];

export default authRoutes;
