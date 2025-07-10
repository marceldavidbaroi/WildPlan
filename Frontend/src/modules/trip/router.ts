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
      {
        name: 'trip_join',
        path: 'join/:id',
        component: () => import('./pages/TripJoinIndex.vue'),
      },

      {
        name: 'trip_settings',
        path: 'settings/:id',
        component: () => import('./pages/TripSettings.vue'),
      },
      {
        name: 'trip_details',
        path: ':id',
        component: () => import('./pages/TripDetails.vue'),
      },
    ],
  },
];

export default authRoutes;
