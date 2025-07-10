<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <!-- Overlay -->
    <div class="auth-overlay"></div>

    <!-- Content -->
    <q-page-container class="auth-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.auth-layout {
  position: relative;
  background-image: url('/images/auth_bg.png'); // remove `/public`
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

.auth-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4); // Adjust opacity for desired darkness
  z-index: 1;
}

.auth-content {
  position: relative;
  z-index: 2;
}
</style>
