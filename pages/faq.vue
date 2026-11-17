<template>
  <div class="content-page">
    <section data-edit-section="intro">
      <h1>{{ settings.title }}</h1>
      <div v-html="safeHtml(settings.intro)" />
    </section>
    <hr />
    <section data-edit-section="questions">
      <details v-for="(entry, index) in settings.questions" :key="index">
        <summary>{{ entry.question }}</summary>
        <div v-html="safeHtml(entry.answer)" />
      </details>
    </section>
    <hr />
    <section data-edit-section="outro" v-html="safeHtml(settings.outro)" />
  </div>
</template>
<script setup lang="ts">
import { safeHtml } from "~/utils/page-content";
const settings = usePageContent("faq");
const plainText = (html: unknown) =>
  safeHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
useHead(() => ({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (settings.value.questions || []).map((entry: any) => ({
          "@type": "Question",
          name: String(entry.question || ""),
          acceptedAnswer: { "@type": "Answer", text: plainText(entry.answer) },
        })),
      }).replace(/</g, "\\u003c"),
    },
  ],
}));
</script>
