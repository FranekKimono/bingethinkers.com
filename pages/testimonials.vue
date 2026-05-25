<template>
  <div class="testimonials-page">
    <header class="testimonials-page__header content-page">
      <h1 class="section-title">Testimonials</h1>
      <p>
        We've hosted trivia for bars, pubs, and companies across two continents.
        Here's what some of our partners have to say — and a few of the teams we've worked with.
      </p>
    </header>

    <section class="section testimonials-logos">
      <div class="container">
        <h2 class="section-title">Companies We've Worked With</h2>
        <div class="logo-grid">
          <div
            v-for="n in 25"
            :key="n"
            class="logo-card"
            :aria-label="`Company logo ${n} (placeholder)`"
          >
            <span class="logo-card__placeholder">Logo {{ n }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">What People Say</h2>
        <div class="testimonial-feed">
          <template v-for="item in feed" :key="item.key">
            <blockquote
              v-if="item.type === 'testimonial'"
              class="testimonial-card"
            >
              <p class="testimonial-card__quote">"{{ item.data.quote }}"</p>
              <footer class="testimonial-card__author">
                <span class="testimonial-card__name">{{ item.data.name }}</span>
                <span class="testimonial-card__role">{{ item.data.role }}</span>
              </footer>
            </blockquote>

            <div
              v-else-if="item.type === 'gallery-row'"
              class="gallery-row"
            >
              <a
                v-for="img in item.data"
                :key="img"
                :href="`/binge-images/${img}.jpg`"
                target="_blank"
                rel="noopener noreferrer"
                class="gallery-photo"
                :class="{ 'is-loaded': loaded[img] }"
                :aria-label="`Gallery photo ${img}`"
              >
                <NuxtImg
                  :ref="(el) => setImageRef(el, img)"
                  :src="`/binge-images/${img}.jpg`"
                  :alt="`Trivia night photo ${img}`"
                  width="480"
                  height="480"
                  sizes="(max-width: 640px) 45vw, 360px"
                  loading="lazy"
                  @load="loaded[img] = true"
                />
              </a>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const testimonials = [
  {
    id: 1,
    quote: 'Placeholder testimonial — our crowd has never been this engaged on a weeknight. Book them.',
    name: 'Alex Kim',
    role: 'Bar Manager, Placeholder Pub',
  },
  {
    id: 2,
    quote: 'Placeholder testimonial — professional from start to finish. Setup took ten minutes and the room was packed.',
    name: 'Jordan Lee',
    role: 'Events Coordinator, Sample Brewery',
  },
  {
    id: 3,
    quote: 'Placeholder testimonial — we run trivia every month now. Our regulars ask when the next one is before we even announce it.',
    name: 'Sam Park',
    role: 'Owner, Example Taproom',
  },
  {
    id: 4,
    quote: 'Placeholder testimonial — the host read the room perfectly. Funny, sharp, and never lost control of the night.',
    name: 'Taylor Cho',
    role: 'GM, Demo Restaurant Group',
  },
  {
    id: 5,
    quote: 'Placeholder testimonial — best corporate team event we\'ve done. People still talk about the final round.',
    name: 'Morgan Jung',
    role: 'HR Lead, Placeholder Corp',
  },
  {
    id: 6,
    quote: 'Placeholder testimonial — we tried running our own trivia once. Never again. These folks are worth every penny.',
    name: 'Casey Min',
    role: 'Venue Manager, Sample Lounge',
  },
  {
    id: 7,
    quote: 'Placeholder testimonial — brought the energy of a Seoul trivia night to our Winnipeg bar. Instant regulars.',
    name: 'Riley Han',
    role: 'Co-owner, Example Social Club',
  },
  {
    id: 8,
    quote: 'Placeholder testimonial — our Tuesday crowd doubled the first month. The questions are clever without being impossible.',
    name: 'Jamie Yoon',
    role: 'Marketing Director, Sample Hotel Group',
  },
  {
    id: 9,
    quote: 'Placeholder testimonial — they handled our launch night like pros. Sound, pacing, crowd control — all dialed in.',
    name: 'Drew Kang',
    role: 'Owner, Placeholder Brewing Co.',
  },
  {
    id: 10,
    quote: 'Placeholder testimonial — finally trivia that doesn\'t feel like a school quiz. Our staff wants to play on their nights off.',
    name: 'Quinn Sato',
    role: 'GM, Example Sports Bar',
  },
]

const galleryImages = Array.from({ length: 9 }, (_, i) => i + 1)

type FeedItem =
  | { type: 'testimonial'; key: string; data: (typeof testimonials)[number] }
  | { type: 'gallery-row'; key: string; data: number[] }

function pushGalleryRow(items: FeedItem[], startIdx: number): number {
  const pair: number[] = []
  let idx = startIdx
  if (idx < galleryImages.length) pair.push(galleryImages[idx++])
  if (idx < galleryImages.length) pair.push(galleryImages[idx++])
  if (pair.length) {
    items.push({ type: 'gallery-row', key: `gr-${pair.join('-')}`, data: pair })
  }
  return idx
}

const feed = computed<FeedItem[]>(() => {
  const items: FeedItem[] = []
  let galleryIdx = 0

  for (let i = 0; i < testimonials.length; i += 2) {
    items.push({ type: 'testimonial', key: `t-${testimonials[i].id}`, data: testimonials[i] })
    if (i + 1 < testimonials.length) {
      items.push({ type: 'testimonial', key: `t-${testimonials[i + 1].id}`, data: testimonials[i + 1] })
    }
    galleryIdx = pushGalleryRow(items, galleryIdx)
  }

  while (galleryIdx < galleryImages.length) {
    galleryIdx = pushGalleryRow(items, galleryIdx)
  }

  return items
})

const loaded = reactive<Record<number, boolean>>({})

function setImageRef(el: Element | ComponentPublicInstance | null, i: number) {
  nextTick(() => {
    const img = el instanceof HTMLImageElement
      ? el
      : (el as ComponentPublicInstance | null)?.$el as HTMLImageElement | undefined
    if (img?.complete && img.naturalWidth) loaded[i] = true
  })
}

useSeoMeta({
  title: 'Testimonials — Binge Thinkers',
  description: 'See what venues and companies say about Binge Thinkers hosted trivia nights.',
})
</script>

<style scoped>
.testimonials-page__header {
  padding-bottom: 0;
  text-align: center;
  max-width: 640px;
}

.testimonials-page__header h1.section-title {
  font-size: var(--text-display);
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.section-title {
  margin-bottom: 2rem;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.logo-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 5 / 2;
}

.logo-card :deep(img) {
  max-height: 48px;
  width: auto;
  opacity: 0.85;
}

.logo-card__placeholder {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.testimonial-feed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.testimonial-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.75rem;
  margin: 0;
}

.testimonial-card__quote {
  color: var(--color-text);
  font-size: var(--text-lead);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  font-style: italic;
}

.testimonial-card__author {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.testimonial-card__name {
  font-weight: 600;
  font-size: var(--text-base);
}

.testimonial-card__role {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.gallery-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.gallery-photo {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--color-skeleton);
}

.gallery-photo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--color-skeleton) 0%,
    var(--color-skeleton-shine) 50%,
    var(--color-skeleton) 100%
  );
  background-size: 200% 100%;
  animation: gallery-shimmer 1.4s ease-in-out infinite;
  z-index: 0;
}

.gallery-photo.is-loaded::before {
  opacity: 0;
  transition: opacity 0.25s ease;
}

.gallery-photo img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.gallery-photo.is-loaded img {
  opacity: 1;
}

@keyframes gallery-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 640px) {
  .testimonial-feed {
    grid-template-columns: 1fr;
  }

  .gallery-row {
    gap: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-photo::before {
    animation: none;
  }
}
</style>
