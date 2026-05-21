<template>
  <div class="content-page">
    <ContentDoc v-slot="{ doc }">
      <ContentRenderer :value="doc" />
    </ContentDoc>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: doc } = await useAsyncData(route.path, () =>
  queryContent(route.path).findOne()
)

const title = doc.value?.title || 'Binge Thinkers'

useSeoMeta({
  title: `${title} — Binge Thinkers`,
  description: doc.value?.description || 'Professional hosted trivia nights for bars, pubs, and private events.',
})
</script>
