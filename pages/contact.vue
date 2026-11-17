<template>
  <div class="content-page">
    <div data-edit-section="intro">
      <h1>{{ settings?.title }}</h1>
      <p style="color: var(--color-muted); margin-bottom: 2rem">
        {{ settings?.intro }}
      </p>
    </div>

    <section
      class="pricing-blurb"
      data-edit-section="pricing"
      aria-label="Pricing"
    >
      <div class="pricing-blurb__copy">
        <h2>{{ settings?.pricingTitle }}</h2>
        <p>{{ settings?.pricingBody }}</p>
        <p>{{ settings?.pricingCta }}</p>
      </div>
      <NuxtImg
        class="pricing-guy"
        :src="safeImage(settings.image)"
        :alt="settings.imageAlt"
        width="1257"
        height="1079"
        sizes="180px"
        format="webp"
      />
    </section>

    <form data-edit-section="form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">{{ settings.nameLabel }}</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          maxlength="120"
          autocomplete="name"
          :placeholder="settings.namePlaceholder"
        />
      </div>
      <div class="form-group">
        <label for="email">{{ settings.emailLabel }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          maxlength="254"
          autocomplete="email"
          :placeholder="settings.emailPlaceholder"
        />
      </div>
      <div class="form-group">
        <label for="phone">{{ settings.phoneLabel }}</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          maxlength="40"
          autocomplete="tel"
          :placeholder="settings.phonePlaceholder"
        />
      </div>
      <div class="form-group">
        <label for="message">{{ settings.messageLabel }}</label>
        <textarea
          id="message"
          v-model="form.message"
          required
          maxlength="5000"
          :placeholder="settings.messagePlaceholder"
        ></textarea>
      </div>
      <div class="form-hp" aria-hidden="true">
        <label for="bt-confirm">Leave this field empty</label>
        <input
          id="bt-confirm"
          v-model="form.confirm"
          type="text"
          name="bt-confirm"
          tabindex="-1"
          autocomplete="off"
        />
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="status === 'sending'"
      >
        {{ status === "sending" ? settings.sendingText : settings.submitText }}
      </button>
      <p
        v-if="status === 'success'"
        class="form-feedback form-feedback--success"
      >
        {{ settings.successText }}
      </p>
      <p v-if="status === 'error'" class="form-feedback form-feedback--error">
        {{ settings.errorText }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { safeImage } from "~/utils/page-content";
const settings = usePageContent("contact");

const form = reactive({
  name: "",
  email: "",
  phone: "",
  message: "",
  confirm: "",
});
const status = ref<"idle" | "sending" | "success" | "error">("idle");

async function submitForm() {
  status.value = "sending";
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error();
    status.value = "success";
    form.name = form.email = form.phone = form.message = "";
  } catch {
    status.value = "error";
  }
}
</script>

<style scoped>
.form-hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.pricing-blurb {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-accent) 18%, var(--color-surface)),
    color-mix(in srgb, var(--color-primary) 30%, var(--color-surface))
  );
  border: 1px solid
    color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
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
