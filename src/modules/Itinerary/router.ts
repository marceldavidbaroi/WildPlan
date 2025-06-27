import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/itinerary',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'itinerary',
        path: '',
        component: () => import('./pages/ItineraryIndex.vue'),
      },
      {
        name: 'schedular',
        path: 'schedular',
        component: () => import('./pages/SchedularIndex.vue'),
      },
      {
        name: 'itinerary-details',
        path: ':id',
        component: () => import('./pages/ItineraryDetailsIndex.vue'),
      },
      {
        name: 'itinerary-details-day',
        path: ':id/day/:dayId',
        component: () => import('./pages/DaysListIndex.vue'),
      },
    ],
  },

  {
    path: '/external',
    component: () => import('src/layouts/PrintLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        name: 'itinerary-day',
        path: 'trip_day',
        component: () => import('./pages/DailyPlanPreview.vue'),
      },
    ],
  },
];

export default authRoutes;
