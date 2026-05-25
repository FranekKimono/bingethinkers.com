<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img src="/bt-logo-about.jpg" alt="Logo" height="96" style="margin-top: -4px;" />
      <img src="/title-98x600.jpg" alt="Binge Thinkers" width="300" height="49" style="margin-top: 4px;" />
    </NuxtLink>
    <nav class="nav-links">
      <NuxtLink to="/">Home</NuxtLink>
      <a
        v-if="route.path === '/'"
        href="#calendar"
        @click.prevent="scrollToCalendar"
      >Calendar</a>
      <NuxtLink v-else to="/#calendar">Calendar</NuxtLink>
      <NuxtLink to="/testimonials">Testimonials</NuxtLink>
      <NuxtLink to="/our-story">Our Story</NuxtLink>
      <NuxtLink to="/faq" v-if="showFaq">FAQ</NuxtLink>
      <NuxtLink to="/contact" class="nav-book">Book</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()

const { showFaq } = defineProps<{
  showFaq?: boolean
}>()

function scrollToCalendar() {
  document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', '#calendar')
}
</script>

<style scoped>
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
