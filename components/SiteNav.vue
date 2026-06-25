<template>
  <header class="navbar">
    <NuxtLink to="/" class="logo">
      <img src="/bt-logo-about.jpg" alt="Logo" height="96" style="margin-top: -4px;" />
      <img src="/title-98x600.png" alt="Binge Thinkers" width="300" height="49" style="margin-top: 4px;" />
    </NuxtLink>

    <div
      v-if="featuredEvent"
      class="nav-tonight"
      @mouseenter="stopFeaturedEventRotation"
      @mouseleave="startFeaturedEventRotation"
      @focusin="stopFeaturedEventRotation"
      @focusout="handleFeaturedEventFocusOut"
    >
      <a href="#calendar" class="nav-tonight__calendar" @click.prevent="goToCalendar">
        <span class="nav-tonight__label">{{ featuredEventLabel }}</span>
        <span class="nav-tonight__show">{{ featuredEvent.event.title }}</span>
        <template v-if="featuredEventDateLabel">
          <span class="nav-tonight__sep" aria-hidden="true">·</span>
          <span class="nav-tonight__date">{{ featuredEventDateLabel }}</span>
        </template>
        <template v-if="featuredEventTimeLabel">
          <span class="nav-tonight__sep" aria-hidden="true">·</span>
          <span class="nav-tonight__time">{{ featuredEventTimeLabel }}</span>
        </template>
      </a>
      <template v-if="featuredEvent.event.venue">
        <span class="nav-tonight__sep" aria-hidden="true">·</span>
        <VenueLink
          :name="featuredEvent.event.venue"
          :location="featuredEvent.event.location"
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
import { formatDateKey, getUpcomingEvents } from '~/utils/events'

const route = useRoute()
const router = useRouter()

const { showFaq } = defineProps<{
  showFaq?: boolean
}>()

const FEATURED_EVENT_LIMIT = 8
const FEATURED_EVENT_INTERVAL_MS = 6000

const now = ref(new Date())
const upcomingEvents = ref<ReturnType<typeof getUpcomingEvents>>([])
const featuredEventIndex = ref(0)
let featuredEventTimer: ReturnType<typeof window.setInterval> | undefined

const featuredEvent = computed(() => upcomingEvents.value[featuredEventIndex.value] ?? null)

const featuredEventIsToday = computed(() => (
  featuredEvent.value ? formatDateKey(featuredEvent.value.date) === formatDateKey(now.value) : false
))

const firstEventDateKey = computed(() => (
  upcomingEvents.value[0] ? formatDateKey(upcomingEvents.value[0].date) : ''
))

const featuredEventIsNextDate = computed(() => (
  featuredEvent.value ? formatDateKey(featuredEvent.value.date) === firstEventDateKey.value : false
))

const featuredEventLabel = computed(() => {
  if (featuredEventIsToday.value) return 'Tonight:'
  if (featuredEventIsNextDate.value) return 'Next:'
  return 'Upcoming:'
})

const featuredEventDateLabel = computed(() => {
  if (!featuredEvent.value || featuredEventIsToday.value) return ''

  return featuredEvent.value.date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  })
})

const featuredEventTimeLabel = computed(() => (
  featuredEvent.value?.event.time.replace(':00 ', ' ') ?? ''
))

onMounted(() => {
  now.value = new Date()
  upcomingEvents.value = getUpcomingEvents(now.value, FEATURED_EVENT_LIMIT)
  startFeaturedEventRotation()
})

onBeforeUnmount(() => {
  stopFeaturedEventRotation()
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

function startFeaturedEventRotation() {
  if (featuredEventTimer) return
  if (upcomingEvents.value.length <= 1) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  featuredEventTimer = window.setInterval(() => {
    featuredEventIndex.value = (featuredEventIndex.value + 1) % upcomingEvents.value.length
  }, FEATURED_EVENT_INTERVAL_MS)
}

function stopFeaturedEventRotation() {
  if (!featuredEventTimer) return

  window.clearInterval(featuredEventTimer)
  featuredEventTimer = undefined
}

function handleFeaturedEventFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const nextTarget = event.relatedTarget as Node | null
  if (currentTarget?.contains(nextTarget)) return

  startFeaturedEventRotation()
}
</script>

<style scoped>
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
