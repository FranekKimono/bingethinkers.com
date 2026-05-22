<template>
  <div v-if="error" class="ig-error">
    <p>{{ error }}</p>
  </div>
  <div v-else-if="loading" class="ig-loading">
    <p>Loading posts…</p>
  </div>
  <div v-else class="ig-grid">
    <a
      v-for="post in posts"
      :key="post.id"
      :href="post.permalink"
      target="_blank"
      rel="noopener noreferrer"
      class="ig-card"
    >
      <img :src="post.thumbnail" :alt="post.caption" loading="lazy" />
      <div class="ig-overlay">
        <span v-if="post.caption">{{ post.caption }}</span>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
interface IgPost {
  id: string
  caption: string
  type: string
  url: string
  permalink: string
  thumbnail: string
  date: string
}

const { data, pending, error: fetchError } = await useFetch('/api/instagram')

const loading = computed(() => pending.value)
const error = computed(() => {
  if (fetchError.value) return 'Could not load Instagram feed.'
  return (data.value as any)?.error || null
})
const posts = computed<IgPost[]>(() => (data.value as any)?.posts || [])
</script>

<style scoped>
.ig-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.ig-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  display: block;
}
.ig-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.ig-card:hover img {
  transform: scale(1.05);
}
.ig-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(6, 3, 10, 0.85), transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s;
}
.ig-card:hover .ig-overlay {
  opacity: 1;
}
.ig-overlay span {
  color: #fff;
  font-size: 0.8rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ig-error, .ig-loading {
  text-align: center;
  color: var(--color-muted);
  padding: 2rem;
}
@media (max-width: 640px) {
  .ig-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
