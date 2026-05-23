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
        :class="{ 'is-loaded': loaded[i] }"
      >
        <NuxtImg
          :ref="(el) => setImageRef(el, i)"
          :src="`/binge-images/${i}.jpg`"
          :alt="`Gallery image ${i}`"
          width="750"
          height="750"
          sizes="(max-width: 640px) 50vw, 367px"
          loading="lazy"
          @load="loaded[i] = true"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const loaded = reactive<Record<number, boolean>>({})

function setImageRef(el: Element | ComponentPublicInstance | null, i: number) {
  nextTick(() => {
    const img = el instanceof HTMLImageElement
      ? el
      : (el as ComponentPublicInstance | null)?.$el as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth) loaded[i] = true
  })
}

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
  position: relative;
  background: #1a1520;
}
.ig-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #1a1520 0%,
    #2a2235 50%,
    #1a1520 100%
  );
  background-size: 200% 100%;
  animation: ig-shimmer 1.4s ease-in-out infinite;
  z-index: 0;
}
.ig-card.is-loaded::before {
  opacity: 0;
  transition: opacity 0.25s ease;
}
.ig-card img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.ig-card.is-loaded img {
  opacity: 1;
}
@keyframes ig-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ig-card::before {
    animation: none;
  }
}
@media (max-width: 640px) {
  .ig-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0;
  }
}
</style>
