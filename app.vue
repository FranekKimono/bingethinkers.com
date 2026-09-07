<template>
  <div>
    <template v-if="isAdmin"><NuxtPage /></template>
    <template v-else
      ><SiteNav :show-faq="true" />
      <main><NuxtPage /></main>
      <SiteFooter
    /></template>
  </div>
</template>
<script setup lang="ts">
const route = useRoute();
const isAdmin = computed(() => route.path.replace(/\/$/, "") === "/admin");
</script>
