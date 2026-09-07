<template>
  <div class="image-field">
    <img v-if="modelValue" :src="previewUrl" alt="Selected image" />
    <div class="editor-inline">
      <button type="button" @click="choosing = !choosing">Choose image</button
      ><label class="editor-button"
        >Upload image<input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          class="visually-hidden"
          @change="upload"
      /></label>
    </div>
    <p v-if="error" class="editor-error" role="alert">{{ error }}</p>
    <div v-if="choosing" class="media-picker">
      <input
        v-model="search"
        aria-label="Find an image"
        placeholder="Find an image…"
      />
      <div class="media-grid">
        <button
          v-for="url in filtered"
          :key="url"
          type="button"
          @click="
            emit('update:modelValue', url);
            choosing = false;
          "
          :title="url"
        >
          <img
            :src="pendingPreview(url)"
            :alt="url.split('/').pop()"
            loading="lazy"
          />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PendingImage } from "~/utils/editor-repository";
const props = defineProps<{
    modelValue: string;
    media: string[];
    pending: PendingImage[];
  }>(),
  emit = defineEmits<{
    "update:modelValue": [value: string];
    upload: [image: PendingImage];
  }>();
const choosing = ref(false),
  search = ref(""),
  error = ref("");
const pendingPreview = (url: string) =>
  props.pending.find((p) => p.path === `public${url}`)?.preview || url;
const previewUrl = computed(() => pendingPreview(props.modelValue));
const filtered = computed(() =>
  [
    ...new Set([
      ...props.media,
      ...props.pending.map((p) => p.path.replace(/^public/, "")),
    ]),
  ].filter((u) => u.toLowerCase().includes(search.value.toLowerCase())),
);
async function upload(event: Event) {
  error.value = "";
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (
    ![
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/avif",
    ].includes(file.type) ||
    file.size > 8 * 1024 * 1024
  ) {
    error.value =
      "Choose a PNG, JPG, WebP, GIF, or AVIF image smaller than 8 MB.";
    return;
  }
  const extension = (
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    } as Record<string, string>
  )[file.type];
  const path = `public/images/${crypto.randomUUID()}-${file.name
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 60)}.${extension}`;
  const buffer = await file.arrayBuffer();
  let binary = "";
  for (const byte of new Uint8Array(buffer))
    binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  const image = { path, base64, preview: `data:${file.type};base64,${base64}` };
  emit("upload", image);
  emit("update:modelValue", path.replace(/^public/, ""));
  choosing.value = false;
}
</script>
