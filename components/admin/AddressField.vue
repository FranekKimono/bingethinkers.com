<template>
  <div class="address-field">
    <input
      :id="id"
      :value="modelValue"
      autocomplete="off"
      role="combobox"
      :aria-expanded="suggestions.length > 0"
      :aria-controls="`${id}-results`"
      :aria-activedescendant="
        active >= 0 ? `${id}-result-${active}` : undefined
      "
      aria-autocomplete="list"
      placeholder="Street address, city, province"
      @input="change"
      @keydown="keyDown"
      @blur="closeLater"
    />
    <ul
      v-if="suggestions.length"
      :id="`${id}-results`"
      role="listbox"
      class="address-results"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${id}-result-${index}`"
        :key="index"
        role="option"
        :aria-selected="index === active"
      >
        <button type="button" @mousedown.prevent @click="choose(suggestion)">
          {{ suggestion.text.text }}
        </button>
      </li>
    </ul>
    <small>{{ message || "Enter an address or choose a suggestion." }}</small>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
    id: string;
    modelValue: string;
    mapsKey?: string;
  }>(),
  emit = defineEmits<{
    "update:modelValue": [value: string];
    place: [value: string];
  }>();
const suggestions = ref<any[]>([]),
  active = ref(-1),
  message = ref("");
let places: any,
  session: any,
  timer: ReturnType<typeof setTimeout>,
  blurTimer: ReturnType<typeof setTimeout>,
  requestId = 0,
  disposed = false;
onMounted(async () => {
  if (!props.mapsKey) {
    message.value = "Enter the address manually.";
    return;
  }
  try {
    const w = window as any;
    if (!w.__bingePlacesPromise)
      w.__bingePlacesPromise = new Promise((resolve, reject) => {
        if (w.google?.maps?.importLibrary) {
          w.google.maps.importLibrary("places").then(resolve, reject);
          return;
        }
        w.__bingeEditorMapsReady = () =>
          w.google.maps.importLibrary("places").then(resolve, reject);
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(props.mapsKey!)}&loading=async&v=weekly&callback=__bingeEditorMapsReady`;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    places = await w.__bingePlacesPromise;
    session = new places.AutocompleteSessionToken();
  } catch {
    message.value =
      "Address suggestions are unavailable. You can enter an address manually.";
  }
});
function change(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value);
  emit("place", "");
  suggestions.value = [];
  active.value = -1;
  clearTimeout(timer);
  const id = ++requestId;
  if (!places || value.trim().length < 3) return;
  timer = setTimeout(async () => {
    try {
      const result =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value.trim(),
          includedRegionCodes: ["ca"],
          language: "en",
          region: "ca",
          sessionToken: session,
        });
      if (!disposed && id === requestId)
        suggestions.value = result.suggestions
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .slice(0, 6);
    } catch {
      if (!disposed && id === requestId)
        message.value =
          "Enter the address manually; suggestions are unavailable.";
    }
  }, 250);
}
async function choose(prediction: any) {
  ++requestId;
  const id = requestId;
  suggestions.value = [];
  active.value = -1;
  const place = prediction.toPlace();
  try {
    await place.fetchFields({ fields: ["formattedAddress"] });
  } catch {}
  if (disposed || id !== requestId) return;
  emit("update:modelValue", place.formattedAddress || prediction.text.text);
  emit("place", prediction.placeId);
  session = new places.AutocompleteSessionToken();
}
function closeLater() {
  blurTimer = setTimeout(() => {
    suggestions.value = [];
    active.value = -1;
  }, 150);
}
function keyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    suggestions.value = [];
    active.value = -1;
  }
  if (!suggestions.value.length) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    active.value = Math.min(active.value + 1, suggestions.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    active.value = Math.max(0, active.value - 1);
  } else if (e.key === "Enter" && active.value >= 0) {
    e.preventDefault();
    choose(suggestions.value[active.value]);
  }
}
onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(timer);
  clearTimeout(blurTimer);
});
</script>
