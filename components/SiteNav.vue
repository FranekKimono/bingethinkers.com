<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img src="/bt-logo-about.jpg" alt="Logo" height="96" style="margin-top: -4px;" />
      <img src="/title-98x600.png" alt="Binge Thinkers" width="300" height="49" style="margin-top: 4px;" />
    </NuxtLink>

    <div v-if="nextEvent" class="nav-tonight">
      <a href="#calendar" class="nav-tonight__calendar" @click.prevent="goToCalendar">
        <span class="nav-tonight__label">{{ nextEventLabel }}</span>
        <span class="nav-tonight__show">{{ nextEvent.event.title }}</span>
        <template v-if="nextEventDateLabel">
          <span class="nav-tonight__sep" aria-hidden="true">·</span>
          <span class="nav-tonight__date">{{ nextEventDateLabel }}</span>
        </template>
        <template v-if="nextEventTimeLabel">
          <span class="nav-tonight__sep" aria-hidden="true">·</span>
          <span class="nav-tonight__time">{{ nextEventTimeLabel }}</span>
        </template>
      </a>
      <template v-if="nextEvent.event.venue">
        <span class="nav-tonight__sep" aria-hidden="true">·</span>
        <VenueLink
          :name="nextEvent.event.venue"
          :location="nextEvent.event.location"
          link-class="nav-tonight__venue"
        />
      </template>
    </div>

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
import { formatDateKey, getNextEvent } from '~/utils/events'

const route = useRoute()
const router = useRouter()

const { showFaq } = defineProps<{
  showFaq?: boolean
}>()

const now = ref(new Date())
const nextEvent = ref<ReturnType<typeof getNextEvent>>(null)

const nextEventIsToday = computed(() => (
  nextEvent.value ? formatDateKey(nextEvent.value.date) === formatDateKey(now.value) : false
))

const nextEventLabel = computed(() => (nextEventIsToday.value ? 'Tonight:' : 'Next:'))

const nextEventDateLabel = computed(() => {
  if (!nextEvent.value || nextEventIsToday.value) return ''

  return nextEvent.value.date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  })
})

const nextEventTimeLabel = computed(() => (
  nextEvent.value?.event.time.replace(':00 ', ' ') ?? ''
))

onMounted(() => {
  now.value = new Date()
  nextEvent.value = getNextEvent(now.value)
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
