<template>
  <div class="locations-workspace">
    <section class="locations-main">
      <div class="editor-heading">
        <div>
          <p class="editor-eyebrow">SAVED PLACES</p>
          <h1>Your Locations</h1>
          <p>Add a place once, then use it whenever you plan an Event.</p>
        </div>
        <button type="button" class="editor-primary" @click="create">
          + Add Location
        </button>
      </div>
      <div class="editor-inline locations-filter">
        <input
          v-model="search"
          aria-label="Search Locations"
          placeholder="Find a Location…"
        /><label
          ><input v-model="showArchived" type="checkbox" /> Include
          archived</label
        >
      </div>
      <div class="location-cards">
        <article
          v-for="location in filtered"
          :key="location.id"
          class="location-card"
        >
          <div>
            <span v-if="location.archived" class="editor-badge">Archived</span>
            <h2>{{ location.name }}</h2>
            <p>{{ location.address }}</p>
            <small
              >{{ usage(location.id) }} schedule{{
                usage(location.id) === 1 ? "" : "s"
              }}
              use this Location</small
            >
          </div>
          <div class="editor-inline">
            <button type="button" @click="edit(location)">Edit Location</button
            ><button type="button" @click="archive(location)">
              {{ location.archived ? "Restore" : "Archive" }}
            </button>
          </div>
        </article>
      </div>
      <p v-if="!filtered.length" class="editor-empty">
        No Locations match. Try another search or include archived Locations.
      </p>
    </section>
    <aside
      v-if="draft"
      ref="panel"
      class="editor-panel"
      aria-label="Location details"
    >
      <div class="editor-panel-heading">
        <h2>{{ existing ? "Edit Location" : "New Location" }}</h2>
        <button type="button" aria-label="Close Location editor" @click="close">
          ×
        </button>
      </div>
      <form class="editor-fields" @submit.prevent="emit('publish')">
        <label for="location-name">Location name</label
        ><input id="location-name" v-model="draft.name" required /><label
          for="location-address"
          >Address</label
        ><AdminAddressField
          id="location-address"
          v-model="draft.address"
          :maps-key="mapsKey"
          @place="draft.placeId = $event"
        />
        <p v-if="existing" class="editor-note">
          Corrections update every Event using this Location, including past
          Events. If the venue moved, add a new Location instead.
        </p>
        <p v-if="error" role="alert" class="editor-error">{{ error }}</p>
        <button type="submit" class="editor-primary">Save &amp; publish</button>
      </form>
    </aside>
  </div>
</template>
<script setup lang="ts">
import type { EventRecord, Location } from "~/utils/schedule";
const props = defineProps<{
    modelValue: Location[];
    events: EventRecord[];
    mapsKey?: string;
  }>(),
  emit = defineEmits<{
    "update:modelValue": [locations: Location[]];
    publish: [];
    editing: [value: boolean];
  }>();
const draft = ref<Location | null>(null),
  existing = ref(false),
  search = ref(""),
  showArchived = ref(false),
  error = ref("");
const panel = ref<HTMLElement>(),
  initialDraft = ref("");
const panelDirty = computed(
  () =>
    !!draft.value &&
    (!existing.value || JSON.stringify(draft.value) !== initialDraft.value),
);
watch(panelDirty, (value: boolean) => emit("editing", value));
function focusPanel() {
  nextTick(() => {
    if (window.matchMedia("(max-width:760px)").matches)
      panel.value?.scrollIntoView({ block: "start" });
    panel.value?.querySelector("input")?.focus({ preventScroll: true });
  });
}
const filtered = computed(() =>
  props.modelValue.filter(
    (l) =>
      (showArchived.value || !l.archived) &&
      `${l.name} ${l.address}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
);
function usage(id: string) {
  return new Set(
    props.events
      .filter(
        (r) =>
          r.locationId === id ||
          Object.values(r.exceptions).some((e) => e.locationId === id),
      )
      .map((r) => r.seriesId),
  ).size;
}
function edit(location: Location) {
  if (
    panelDirty.value &&
    !confirm("Discard the changes in the Location panel?")
  )
    return;
  draft.value = { ...location };
  existing.value = true;
  error.value = "";
  initialDraft.value = JSON.stringify(draft.value);
  focusPanel();
}
function create() {
  if (
    panelDirty.value &&
    !confirm("Discard the changes in the Location panel?")
  )
    return;
  draft.value = {
    id: crypto.randomUUID(),
    name: "",
    address: "",
    archived: false,
  };
  existing.value = false;
  error.value = "";
  initialDraft.value = JSON.stringify(draft.value);
  focusPanel();
}
function close() {
  if (
    panelDirty.value &&
    !confirm("Discard the changes in the Location panel?")
  )
    return;
  draft.value = null;
  emit("editing", false);
}
function archive(location: Location) {
  if (draft.value?.id === location.id)
    draft.value.archived = !location.archived;
  emit(
    "update:modelValue",
    props.modelValue.map((l) =>
      l.id === location.id ? { ...l, archived: !l.archived } : l,
    ),
  );
}
function applyEditor() {
  if (!draft.value) return true;
  if (!draft.value.name.trim() || !draft.value.address.trim()) {
    error.value = "Enter a name and address for this Location.";
    return false;
  }
  const saved = {
    ...draft.value,
    name: draft.value.name.trim(),
    address: draft.value.address.trim(),
  };
  emit(
    "update:modelValue",
    existing.value
      ? props.modelValue.map((l) => (l.id === saved.id ? saved : l))
      : [...props.modelValue, saved],
  );
  draft.value = null;
  emit("editing", false);
  return true;
}
defineExpose({ applyEditor });
</script>
