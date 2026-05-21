<template>
  <div>
    <section class="hero">
      <NuxtImg src="/splash.jpg" alt="Binge Thinkers Trivia Night" class="hero-splash" sizes="sm:100vw lg:700px" />
      <h1 v-if="settings" v-html="formatAccent(settings.heroTitle)" />
      <p v-if="settings" v-html="formatAccent(settings.heroSubtitle)" />
      <NuxtLink v-if="settings" to="/contact" class="btn btn-primary">{{ settings.ctaText }}</NuxtLink>
    </section>

    <section class="section">
      <div class="container">
        <div class="card-grid">
          <div class="card">
            <h3>🎤 {{ settings?.feature1Title }}</h3>
            <p>{{ settings?.feature1Body }}</p>
          </div>
          <div class="card">
            <h3>📋 {{ settings?.feature2Title }}</h3>
            <p>{{ settings?.feature2Body }}</p>
          </div>
          <div class="card">
            <h3>💰 {{ settings?.feature3Title }}</h3>
            <p>{{ settings?.feature3Body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="text-align:center">
      <div class="container">
        <h2 style="margin-bottom:1rem">Ready to host?</h2>
        <p style="color:var(--color-muted); margin-bottom:2rem">
          Reach out and we'll get you booked within 48 hours.
        </p>
        <NuxtLink to="/contact" class="btn btn-outline">Get in Touch</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: settings } = await useAsyncData('home-settings', () =>
  queryContent('settings/home').findOne()
)

function formatAccent(text: string): string {
  return text
    .replace(/\\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<span class="accent">$1</span>')
}

useSeoMeta({
  title: 'Binge Thinkers — Hosted Trivia Nights',
  description: 'Book a live trivia night for your bar, pub, or private event. Professional hosts bring the questions and energy — you bring the crowd.',
  ogTitle: 'Binge Thinkers — Hosted Trivia Nights',
  ogDescription: 'Book a live trivia night for your bar, pub, or private event.',
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
        priceRange: '\$\$',
      }),
    },
  ],
})
</script>
