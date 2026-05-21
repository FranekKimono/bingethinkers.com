<template>
  <div class="error-page">
    <h1>404</h1>
    <p>This page doesn't exist. Maybe it was a trivia question we haven't written yet.</p>
    <NuxtLink to="/" class="btn btn-primary">Back to Home</NuxtLink>
  </div>
</template>

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
