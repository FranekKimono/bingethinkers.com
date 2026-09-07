<template>
  <div class="content-page">
    <section data-edit-section="intro">
      <h1>{{ settings.title }}</h1>
      <div v-html="safeHtml(settings.intro)" />
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
import { safeHtml } from "~/utils/page-content";
const settings = usePageContent("privacy");
</script>
