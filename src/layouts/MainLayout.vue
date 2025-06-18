<template>
  <q-layout view="hHh lpR fFf ">
    <q-header v-if="$q.screen.lt.md" style="background: #f5f1e9">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="primary"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :mini="miniState"
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"
      show-if-above
      bordered
      class="bg-primary text-white"
    >
      <!-- Top image with responsive height -->
      <q-img
        class="absolute-top"
        src="/public/images/p_photo_1.png"
        :style="
          miniState
            ? 'height: 80px; transition: height 0.3s;'
            : 'height: 150px; transition: height 0.3s;'
        "
      >
        <!-- Avatar and name area -->
        <div class="absolute-bottom bg-transparent text-white text-center q-pa-sm">
          <q-avatar
            :size="miniState ? '32px' : '56px'"
            class="q-mb-xs"
            style="transition: all 0.3s"
          >
            <img :src="authStore.profile?.photoURL ?? 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>

          <!-- Only show name when not mini -->
          <div v-if="!miniState" class="glass-info">
            <div class="text-weight-bold">{{ authStore.profile?.displayName }}</div>
            <div class="text-subtitle2">{{ authStore.profile?.email }}</div>
          </div>
        </div>
      </q-img>

      <!-- Scrollable nav list -->
      <q-scroll-area
        :style="
          miniState
            ? 'height: calc(100% - 80px); margin-top: 80px;'
            : 'height: calc(100% - 150px); margin-top: 150px;'
        "
      >
        <q-list>
          <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container style="background-color: #f5f1e9">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useAuthStore } from 'src/modules/auth/store';
const authStore = useAuthStore();

const miniState = ref(true);
const linksList: EssentialLinkProps[] = [
  {
    title: 'Dashboard',
    caption: 'Overview & quick actions',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    title: 'Trip',
    caption: 'Manage your trips',
    icon: 'card_travel',
    link: '/trip',
  },
  {
    title: 'Itinerary',
    caption: 'Plan your trip day-by-day',
    icon: 'event_note',
    link: '/itinerary',
  },
  {
    title: 'Packing',
    caption: 'Prepare your packing list',
    icon: 'checklist',
    link: '/packing',
  },
  {
    title: 'Tasks',
    caption: 'To-do and planning tasks',
    icon: 'task',
    link: '/tasks',
  },
  {
    title: 'Budget',
    caption: 'Expenses and cost tracking',
    icon: 'attach_money',
    link: '/budget',
  },
  {
    title: 'Maps',
    caption: 'View routes and places',
    icon: 'map',
    link: '/maps',
  },
  {
    title: 'Chat',
    caption: 'Group communication',
    icon: 'forum',
    link: '/chat',
  },
  {
    title: 'Settings',
    caption: 'Settings for user',
    icon: 'settings',
    link: '/settings',
  },
  {
    title: 'Logout',
    caption: 'Sign out of your account',
    icon: 'logout',
    link: '/logout',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
.glass-info {
  background: rgba(255, 255, 255, 0.1); /* light transparent white */
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* for Safari */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>
