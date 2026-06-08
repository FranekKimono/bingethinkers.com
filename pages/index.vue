<template>
  <div>
    <section class="hero">
      <div class="hero-splash-wrap skeleton-image" :class="{ 'is-loaded': splashLoaded }">
        <NuxtImg
          ref="splashRef"
          src="/splash.jpg"
          alt="Binge Thinkers Trivia Night"
          class="hero-splash"
          sizes="sm:100vw lg:700px"
          @load="splashLoaded = true"
        />
      </div>
      <h1 v-if="settings" v-html="formatAccent(settings.heroTitle)" />
      <p v-if="settings" v-html="formatAccent(settings.heroSubtitle)" />
      <NuxtLink v-if="settings" to="/contact" class="btn btn-primary">{{ settings.ctaText }}</NuxtLink>
    </section>

    <section class="section home-intro">
      <div class="container">
        <div class="home-intro__inner">
          <p class="text-eyebrow home-intro__eyebrow">{{ settings?.introEyebrow }}</p>
        </div>
        <div class="hero-splash-wrap skeleton-image" :class="{ 'is-loaded': introSplashLoaded }">
          <NuxtImg
            ref="introSplashRef"
            src="/splash-dali.jpg"
            alt="Salvador Dalí and Miles Davis in a library"
            class="hero-splash"
            sizes="sm:100vw lg:700px"
            @load="introSplashLoaded = true"
          />
        </div>
        <div class="home-intro__inner">
          <h2 class="text-display">{{ settings?.introTitle }}</h2>
          <p class="text-lead home-intro__lead">{{ settings?.introBody }}</p>
          <div class="home-intro__links">
            <NuxtLink to="/our-story">Read our story →</NuxtLink>
            <NuxtLink to="/testimonials">See who we've worked with →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="calendar" class="section home-events">
      <div class="container">
        <h2 class="section-title">{{ settings?.eventsTitle }}</h2>
        <p class="section-subtitle">{{ settings?.eventsSubtitle }}</p>
        <EventsCalendar />
      </div>
    </section>

    <section class="section home-cta">
      <div class="container home-cta__inner">
        <h2 class="text-display home-cta__title">{{ settings?.bottomCtaTitle }}</h2>
        <p class="text-lead home-cta__lead">{{ settings?.bottomCtaBody }}</p>
        <NuxtLink to="/contact" class="btn btn-outline">{{ settings?.bottomCtaText }}</NuxtLink>
        <div class="home-cta__links">
          <NuxtLink to="/testimonials">See testimonials →</NuxtLink>
          <NuxtLink to="/faq">Read the FAQ →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: settings } = await useAsyncData('home-settings', () =>
  queryContent('settings/home').findOne()
)

const splashLoaded = ref(false)
const splashRef = ref<ComponentPublicInstance | HTMLImageElement | null>(null)
const introSplashLoaded = ref(false)
const introSplashRef = ref<ComponentPublicInstance | HTMLImageElement | null>(null)

function markImageLoaded(
  refValue: ComponentPublicInstance | HTMLImageElement | null,
  loaded: Ref<boolean>,
) {
  const el = refValue
  const img = el instanceof HTMLImageElement
    ? el
    : (el as ComponentPublicInstance | null)?.$el as HTMLImageElement | undefined
  if (img?.complete && img.naturalWidth) loaded.value = true
}

onMounted(() => {
  nextTick(() => {
    markImageLoaded(splashRef.value, splashLoaded)
    markImageLoaded(introSplashRef.value, introSplashLoaded)
  })
})

function formatAccent(text: string): string {
  return text
    .replace(/\\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<span class="accent">$1</span>')
}

useSeoMeta({
  title: 'Binge Thinkers | Hosted Trivia Nights',
  description: 'Book a lively trivia night for your bar, pub, or private event. We bring the host and questions. You bring the crowd.',
  ogTitle: 'Binge Thinkers | Hosted Trivia Nights',
  ogDescription: 'Book a lively trivia night for your bar, pub, or private event.',
  ogImage: 'https://bingethinkers.com/splash.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Binge Thinkers',
        description: 'Professional hosted trivia nights for bars, pubs, and private events.',
        url: 'https://bingethinkers.com',
        email: 'info@bingethinkers.com',
        image: 'https://bingethinkers.com/splash.jpg',
      }),
    },
  ],
})

</script>

<style scoped>
.home-intro {
  background: linear-gradient(
    180deg,
    var(--color-bg-deep) 0%,
    var(--color-surface-raised) 35%,
    var(--color-border) 50%,
    var(--color-surface-raised) 65%,
    var(--color-bg-deep) 100%
  );
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.home-intro__inner {
  max-width: 720px;
  margin-inline: auto;
  text-align: center;
}

.home-intro__eyebrow {
  margin-bottom: 1rem;
}

.home-intro .hero-splash-wrap {
  margin-bottom: 1.5rem;
}

.home-intro h2 {
  margin-bottom: 1.25rem;
}

.home-intro__lead {
  margin-bottom: 1.5rem;
}

.home-intro__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-base);
}

.home-cta {
  background:
    radial-gradient(ellipse 70% 80% at 50% 50%, var(--color-primary-tint-soft) 0%, transparent 65%),
    var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.home-cta__inner {
  text-align: center;
}

.home-cta__title {
  margin-bottom: 1rem;
}

.home-cta__lead {
  margin-bottom: 2rem;
}

.home-cta__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
  font-weight: 600;
  font-size: var(--text-base);
}

.home-events {
  scroll-margin-top: 6.5rem;
}
</style>
