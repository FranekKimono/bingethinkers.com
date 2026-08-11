<template>
  <div class="error-page">
    <h1>{{ statusCode }}</h1>
    <p>{{ message }}</p>
    <NuxtLink to="/" class="btn btn-primary">Back to Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()

const statusCode = computed(() => props.error?.statusCode || 404)
const message = computed(() => {
  if (statusCode.value === 404) {
    return "This page doesn't exist. Maybe it was a trivia question we haven't written yet."
  }
  return props.error?.statusMessage || props.error?.message || 'Something went wrong.'
})
</script>

<style scoped>
.error-page {
  text-align: center;
  padding: 8rem 1.5rem;
}
.error-page h1 {
  font-size: 5rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
}
.error-page p {
  color: var(--color-muted);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
</style>
