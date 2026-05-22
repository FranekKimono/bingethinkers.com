<template>
  <div class="gallery-page">
    <div class="content-page" style="padding-bottom: 0;">
      <h1>Gallery</h1>
      <p style="color: var(--color-muted); margin: -0.5rem 0 2rem;">
        Highlights from our trivia nights. Follow us on
        <a href="https://instagram.com/binge.thinkers" target="_blank" rel="noopener noreferrer">@binge.thinkers</a>.
      </p>
    </div>
    <div class="ig-grid">
      <a
        v-for="i in 9"
        :key="i"
        :href="`/binge-images/${i}.jpg`"
        target="_blank"
        class="ig-card"
      >
        <img :src="`/binge-images/${i}.jpg`" :alt="`Gallery image ${i}`" loading="lazy" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Gallery — Binge Thinkers',
  description: 'Photos from Binge Thinkers trivia nights. See the energy, the laughs, and the competition.',
})
</script>

<style scoped>
.ig-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.ig-card {
  aspect-ratio: 1;
  overflow: hidden;
  display: block;
}
.ig-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 640px) {
  .ig-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0;
  }
}
</style>
