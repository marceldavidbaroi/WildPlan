import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import auth from 'src/modules/auth/router';

const routes: RouteRecordRaw[] = [
  ...auth,

  // {
  //   path: '/unauthorized',
  //   name: 'unauthorized',
  //   component: () => import('src/components/UnauthincatedPage.vue'),
  // },
  // {
  //   path: '/:catchAll(.*)*',
  //   name: 'ErrorNotFound',
  //   component: () => import('src/components/PageNotFound.vue'),
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
