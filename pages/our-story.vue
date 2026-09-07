<template>
  <div class="content-page">
    <div class="story-banner" data-edit-section="banner">
      <NuxtImg
        :src="safeImage(settings.bannerImage)"
        :alt="settings.bannerAlt"
        width="1920"
        height="1080"
        sizes="sm:100vw md:720px"
        class="story-wide"
      />
    </div>
    <section data-edit-section="intro">
      <h1>{{ settings.title }}</h1>
      <div v-html="safeHtml(settings.intro)" />
      <NuxtImg
        :src="safeImage(settings.photoImage)"
        :alt="settings.photoAlt"
        class="story-wide"
        sizes="sm:100vw md:720px"
      />
      <div v-html="safeHtml(settings.afterPhoto)" />
    </section>
    <section
      v-for="(section, index) in settings.sections"
      :key="index"
      :data-edit-section="`section-${index}`"
    >
      <h2>{{ section.heading }}</h2>
      <div v-html="safeHtml(section.body)" />
    </section>
  </div>
</template>
<script setup lang="ts">
import { safeHtml, safeImage } from "~/utils/page-content";
const settings = usePageContent("our-story");
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
