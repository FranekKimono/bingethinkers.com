<template>
  <div class="content-page">
    <ContentRenderer :value="doc" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: doc } = await useAsyncData(route.path, () =>
  queryContent(route.path).findOne()
)

if (!doc.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

useSeoMeta({
  title: `${doc.value.title || 'Binge Thinkers'} | Binge Thinkers`,
  description: doc.value.description || 'Professional hosted trivia nights for bars, pubs, and private events.',
})
</script>
