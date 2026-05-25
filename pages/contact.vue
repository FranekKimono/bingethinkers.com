<template>
  <div class="content-page">
    <h1>Book & Contact</h1>
    <p style="color:var(--color-muted); margin-bottom:2rem">
      Ready to book a trivia night? Fill out the form below and we'll get back to you within 24 hours.
    </p>

    <section class="pricing-blurb">
      <h2>Pricing</h2>
      <p>
        Every venue is different — group size, day of the week, how often you want to run trivia,
        and whether you need something custom all affect what makes sense for you.
      </p>
      <p>
        We don't publish fixed rates here. <strong style="color:var(--color-text)">Ask us for a quote</strong>
        and we'll put together something that fits your space and your crowd.
      </p>
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
        <textarea id="message" v-model="form.message" required
          placeholder="Date, location, number of people — any details help."></textarea>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Sending…' : 'Send Message' }}
      </button>
      <p v-if="status === 'success'" class="form-feedback form-feedback--success">✓ Message sent! We'll be in touch soon.</p>
      <p v-if="status === 'error'" class="form-feedback form-feedback--error">Something went wrong. Please try again or email us directly.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Book & Contact — Binge Thinkers',
  description: 'Book a hosted trivia night or ask for a quote. We respond within 24 hours.',
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.75rem;
  margin-bottom: 2.5rem;
}

.pricing-blurb h2 {
  font-size: var(--text-subsection);
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.pricing-blurb p {
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}

.pricing-blurb p:last-child {
  margin-bottom: 0;
}
</style>
