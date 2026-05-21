<template>
  <div class="content-page">
    <h1>Contact Us</h1>
    <p style="color:var(--color-muted); margin-bottom:2rem">
      Ready to book a trivia night? Fill out the form below and we'll get back to you within 24 hours.
    </p>

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
      <p v-if="status === 'success'" style="color:#4ade80; margin-top:1rem">✓ Message sent! We'll be in touch soon.</p>
      <p v-if="status === 'error'" style="color:#f87171; margin-top:1rem">Something went wrong. Please try again or email us directly.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact Binge Thinkers — Book a Trivia Night',
  description: 'Get in touch to book a hosted trivia night for your bar, pub, or private event. We respond within 24 hours.',
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
