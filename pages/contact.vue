<template>
  <div class="content-page">
    <h1>{{ settings?.title }}</h1>
    <p style="color:var(--color-muted); margin-bottom:2rem">{{ settings?.intro }}</p>

    <section class="pricing-blurb" aria-label="Pricing">
      <div class="pricing-blurb__copy">
        <h2>{{ settings?.pricingTitle }}</h2>
        <p>{{ settings?.pricingBody }}</p>
        <p>{{ settings?.pricingCta }}</p>
      </div>
      <NuxtImg
        class="pricing-guy"
        src="/binge-thinkers-guy.png"
        alt="Binge Thinkers mascot"
        width="1257"
        height="1079"
        sizes="180px"
        format="webp"
      />
    </section>

    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" required placeholder="Your name" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required placeholder="you@example.com" />
      </div>
      <div class="form-group">
        <label for="phone">Phone (optional)</label>
        <input id="phone" v-model="form.phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>
      <div class="form-group">
        <label for="message">Tell us about your event</label>
		<textarea id="message" v-model="form.message" required placeholder="Date, venue, crowd size. Anything helpful."></textarea>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Sending…' : 'Send Message' }}
      </button>
      <p v-if="status === 'success'" class="form-feedback form-feedback--success">✓ Message sent! We'll be in touch soon.</p>
      <p v-if="status === 'error'" class="form-feedback form-feedback--error">Something went wrong. Please try again in a moment.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const { data: settings } = await useAsyncData('contact-settings', () =>
  queryContent('settings/contact').findOne()
)

useSeoMeta({
  title: 'Book & Contact | Binge Thinkers',
  description: 'Book a hosted trivia night or ask for a quote.',
})

const form = reactive({ name: '', email: '', phone: '', message: '' })
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

async function submitForm() {
  status.value = 'sending'
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) throw new Error()
    status.value = 'success'
    form.name = form.email = form.phone = form.message = ''
  } catch {
    status.value = 'error'
  }
}
</script>

<style scoped>
.pricing-blurb {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-accent) 18%, var(--color-surface)),
    color-mix(in srgb, var(--color-primary) 30%, var(--color-surface))
  );
  border: 1px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  border-radius: var(--radius);
  padding: 1rem 1.75rem 1.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 0 32px color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.pricing-blurb__copy {
  flex: 1 1 auto;
  min-width: 0;
}

.pricing-blurb h2 {
  font-size: var(--text-subsection);
  margin: 0 0 0.75rem;
  color: var(--color-accent);
}

.pricing-blurb p {
  color: color-mix(in srgb, var(--color-text) 82%, var(--color-accent));
  margin-bottom: 0.75rem;
}

.pricing-blurb p:last-child {
  margin-bottom: 0;
}

.pricing-guy {
  flex: 0 0 auto;
  width: 180px;
  height: auto;
  max-width: 36%;
  display: block;
  margin: 0;
  background: transparent;
}

@media (max-width: 640px) {
  .pricing-blurb {
    flex-direction: column;
    align-items: stretch;
  }

  .pricing-guy {
    width: min(200px, 55%);
    max-width: none;
    margin: 0.25rem auto 0;
  }
}
</style>
