<template>
  <div class="content-page">
    <div
      class="story-banner skeleton-image"
      :class="{ 'is-loaded': bannerLoaded }"
    >
      <NuxtImg
        :ref="setBannerRef"
        src="/binge-thinkers-rectangle-dark.png"
        alt="Binge Thinkers"
        width="1920"
        height="1080"
        sizes="sm:100vw md:720px"
        format="webp"
        class="story-wide"
        @load="bannerLoaded = true"
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

const bannerLoaded = ref(false)

function setBannerRef(el: Element | ComponentPublicInstance | null) {
  nextTick(() => {
    const img = el instanceof HTMLImageElement
      ? el
      : (el as ComponentPublicInstance | null)?.$el as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth) bannerLoaded.value = true
  })
}

useSeoMeta({
  title: `${doc.value?.title || 'Our Story'} | Binge Thinkers`,
  description: doc.value?.description || 'From one bar in South Korea to trivia nights across Winnipeg.',
})
</script>

<style scoped>
.story-banner {
  aspect-ratio: 1920 / 1080;
  margin-bottom: 1.5rem;
}

.story-banner :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: 0;
}
</style>
