<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img src="/bt-logo-about.jpg" alt="Logo" height="96" style="margin-top: -4px;" />
      <img src="/title-98x600.jpg" alt="Binge Thinkers" width="300" height="49" style="margin-top: 4px;" />
    </NuxtLink>

    <a
      v-if="tonightEvent"
      href="#calendar"
      class="nav-tonight"
      @click.prevent="goToCalendar"
    >
      <span class="nav-tonight__label">On tonight:</span>
      <span class="nav-tonight__show">{{ tonightEvent.event.title }}</span>
      <template v-if="tonightEvent.event.time">
        <span class="nav-tonight__sep" aria-hidden="true">·</span>
        <span class="nav-tonight__time">{{ tonightEvent.event.time }}</span>
      </template>
      <template v-if="tonightEvent.event.venue">
        <span class="nav-tonight__sep" aria-hidden="true">·</span>
        <span class="nav-tonight__venue">{{ tonightEvent.event.venue }}</span>
      </template>
    </a>

    <nav class="nav-links">
      <NuxtLink to="/">Home</NuxtLink>
      <a
        v-if="route.path === '/'"
        href="#calendar"
        @click.prevent="scrollToCalendar"
      >Calendar</a>
      <NuxtLink v-else to="/#calendar">Calendar</NuxtLink>
      <NuxtLink to="/testimonials">Testimonials</NuxtLink>
      <NuxtLink to="/our-story">Our Story</NuxtLink>
      <NuxtLink to="/faq" v-if="showFaq">FAQ</NuxtLink>
      <NuxtLink to="/contact" class="nav-book">Book</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { getEventsTonight } from '~/utils/events'

const route = useRoute()
const router = useRouter()

const { showFaq } = defineProps<{
  showFaq?: boolean
}>()

const tonightEvent = ref<ReturnType<typeof getEventsTonight>[0] | null>(null)

onMounted(() => {
  tonightEvent.value = getEventsTonight()[0] ?? null
})

function scrollToCalendar() {
  document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', '#calendar')
}

function goToCalendar() {
  if (route.path === '/') {
    scrollToCalendar()
    return
  }
  router.push('/#calendar')
}
</script>

<style scoped>
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
