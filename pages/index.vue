<template>
  <div>
    <section class="hero" data-edit-section="hero">
      <div
        class="hero-splash-wrap skeleton-image"
        :class="{ 'is-loaded': splashLoaded }"
      >
        <NuxtImg
          ref="splashRef"
          :src="safeImage(settings.heroImage)"
          :alt="settings.heroAlt"
          class="hero-splash"
          sizes="sm:100vw lg:700px"
          @load="splashLoaded = true"
        />
      </div>
      <h1 v-if="settings" v-html="safeHtml(settings.heroTitle)" />
      <p v-if="settings">{{ settings.heroSubtitle }}</p>
      <NuxtLink
        v-if="settings"
        :to="safeLink(settings.ctaUrl)"
        class="btn btn-primary"
        >{{ settings.ctaText }}</NuxtLink
      >
    </section>

    <section class="section home-intro" data-edit-section="intro">
      <div class="container">
        <div class="home-intro__inner">
          <p class="text-eyebrow home-intro__eyebrow">
            {{ settings?.introEyebrow }}
          </p>
        </div>
        <div
          class="hero-splash-wrap splash-wide skeleton-image"
          :class="{ 'is-loaded': introSplashLoaded }"
        >
          <NuxtImg
            ref="introSplashRef"
            :src="safeImage(settings.introImage)"
            :alt="settings.introAlt"
            class="hero-splash"
            sizes="sm:100vw lg:700px"
            @load="introSplashLoaded = true"
          />
        </div>
        <div class="home-intro__inner">
          <h2 class="text-display">{{ settings?.introTitle }}</h2>
          <p class="text-lead home-intro__lead">{{ settings?.introBody }}</p>
          <div class="home-intro__links">
            <NuxtLink :to="safeLink(settings.storyLinkUrl)">{{
              settings.storyLinkText
            }}</NuxtLink>
            <NuxtLink :to="safeLink(settings.clientsLinkUrl)">{{
              settings.clientsLinkText
            }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section
      id="calendar"
      class="section home-events"
      data-edit-section="calendar"
    >
      <div class="container">
        <h2 class="section-title">{{ settings?.eventsTitle }}</h2>
        <p class="section-subtitle">{{ settings?.eventsSubtitle }}</p>
        <EventsCalendar />
      </div>
    </section>

    <section class="section home-cta" data-edit-section="bottom">
      <div class="container home-cta__inner">
        <h2 class="text-display home-cta__title">
          {{ settings?.bottomCtaTitle }}
        </h2>
        <p class="text-lead home-cta__lead">{{ settings?.bottomCtaBody }}</p>
        <NuxtLink
          :to="safeLink(settings.bottomCtaUrl)"
          class="btn btn-outline"
          >{{ settings?.bottomCtaText }}</NuxtLink
        >
        <div class="home-cta__links">
          <NuxtLink :to="safeLink(settings.testimonialsLinkUrl)">{{
            settings.testimonialsLinkText
          }}</NuxtLink>
          <NuxtLink :to="safeLink(settings.faqLinkUrl)">{{
            settings.faqLinkText
          }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { safeHtml, safeImage, safeLink } from "~/utils/page-content";
const settings = usePageContent("home");
const socialImage = computed(() => {
  const image = safeImage(settings.value.heroImage);
  return image.startsWith("/") ? `https://bingethinkers.com${image}` : image;
});
useSeoMeta({
  ogType: "website",
  ogImage: () => socialImage.value,
  twitterCard: "summary_large_image",
});

const splashLoaded = ref(false);
const splashRef = ref<ComponentPublicInstance | HTMLImageElement | null>(null);
const introSplashLoaded = ref(false);
const introSplashRef = ref<ComponentPublicInstance | HTMLImageElement | null>(
  null,
);

function markImageLoaded(
  refValue: ComponentPublicInstance | HTMLImageElement | null,
  loaded: Ref<boolean>,
) {
  const el = refValue;
  const img =
    el instanceof HTMLImageElement
      ? el
      : ((el as ComponentPublicInstance | null)?.$el as
          HTMLImageElement | undefined);
  if (img?.complete && img.naturalWidth) loaded.value = true;
}

onMounted(() => {
  nextTick(() => {
    markImageLoaded(splashRef.value, splashLoaded);
    markImageLoaded(introSplashRef.value, introSplashLoaded);
  });
});

useHead(() => ({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Binge Thinkers",
        description: settings.value.seoDescription,
        url: "https://bingethinkers.com",
        image: socialImage.value,
      }),
    },
  ],
}));
</script>

<style scoped>
.hero :deep(strong) {
  color: var(--color-accent);
  font-weight: inherit;
}

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
    radial-gradient(
      ellipse 70% 80% at 50% 50%,
      var(--color-primary-tint-soft) 0%,
      transparent 65%
    ),
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
