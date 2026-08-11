<template>
  <div class="content-page">
    <div class="story-banner">
      <NuxtImg
        src="/binge-thinkers-rectangle-dark.png"
        alt="Binge Thinkers"
        width="1920"
        height="1080"
        sizes="sm:100vw md:720px"
        format="webp"
        class="story-wide"
      />
    </div>

    <ContentDoc v-slot="{ doc }">
      <ContentRenderer :value="doc" />
    </ContentDoc>
  </div>
</template>

<script setup lang="ts">
const { data: doc } = await useAsyncData('our-story', () =>
  queryContent('/our-story').findOne()
)

useSeoMeta({
  title: `${doc.value?.title || 'Our Story'} | Binge Thinkers`,
  description: doc.value?.description || 'From one bar in South Korea to trivia nights across Winnipeg.',
})
</script>

<style scoped>
.story-banner {
  aspect-ratio: 1920 / 1080;
  margin-bottom: 1.5rem;
  background: transparent;
}

.story-banner :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: 0;
}
</style>
