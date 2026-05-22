<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img src="/bt-logo-about.jpg" alt="Logo" height="96" style="margin-top: -4px;" />
      <img src="/title-98x600.jpg" alt="Binge Thinkers" width="300" height="49" style="margin-top: 4px;" />
    </NuxtLink>
    <nav class="nav-links">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/how-it-works">How It Works</NuxtLink>
      <NuxtLink to="/pricing">Pricing</NuxtLink>
      <NuxtLink to="/gallery" v-if="showGallery">Gallery</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/faq" v-if="showFaq">FAQ</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
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
