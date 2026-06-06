<template>
  <a
    v-if="mapsUrl"
    :href="mapsUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="venue-link"
    :class="linkClass"
    :aria-label="`Open ${name} in Google Maps`"
  >
    {{ name }}
  </a>
  <span v-else :class="linkClass">{{ name }}</span>
</template>

<script setup lang="ts">
import { getVenueMapsUrl } from '~/utils/venues'

const props = defineProps<{
  name: string
  location?: {
    address: string
    placeId?: string
    mapsUrl?: string
  }
  linkClass?: string
}>()

const mapsUrl = computed(() => getVenueMapsUrl(props.name, props.location))
</script>
