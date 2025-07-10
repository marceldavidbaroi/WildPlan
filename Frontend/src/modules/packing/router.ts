import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/packing',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'packing',
        path: '',
        component: () => import('./pages/PackingIndex.vue'),
      },
      {
        name: 'packing-details',
        path: ':id',
        component: () => import('./pages/TripPacking.vue'),
      },
    ],
  },
];

export default authRoutes;
