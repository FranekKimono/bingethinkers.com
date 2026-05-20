<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img
        src="/logo.svg"
        alt="Binge Thinkers"
        width="160"
        height="48"
      />
    </NuxtLink>
    <nav class="nav-links">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/how-it-works">How It Works</NuxtLink>
      <NuxtLink to="/pricing">Pricing</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
      <NuxtLink to="/faq" v-if="showFaq">FAQ</NuxtLink>
      <NuxtLink to="/gallery" v-if="showGallery">Gallery</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { showFaq, showGallery } = defineProps<{
  showFaq?: boolean
  showGallery?: boolean
}>()
</script>

<style scoped>
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
