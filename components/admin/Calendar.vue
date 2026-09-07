<template>
  <div class="calendar-workspace">
    <section class="calendar-main">
      <div class="editor-heading">
        <div>
          <p class="editor-eyebrow">PUBLIC EVENTS</p>
          <h1>Your calendar</h1>
          <p>Choose a date to add an Event. Choose an Event to make changes.</p>
        </div>
        <button type="button" class="editor-primary" @click="create(today)">
          + Add Event
        </button>
      </div>
      <div class="calendar-toolbar">
        <div class="editor-inline">
          <button
            type="button"
            aria-label="Previous month"
            @click="moveMonth(-1)"
          >
            ←</button
          ><button type="button" @click="showToday">Today</button
          ><button type="button" aria-label="Next month" @click="moveMonth(1)">
            →
          </button>
        </div>
        <h2>{{ monthLabel }}</h2>
        <span>Winnipeg time</span>
      </div>
      <div class="calendar-scroll">
        <div class="admin-calendar-grid">
          <div v-for="day in weekdays" :key="day" class="calendar-weekday">
            {{ day.slice(0, 3) }}
          </div>
          <div
            v-for="(date, index) in cells"
            :key="index"
            class="calendar-day"
            :class="{
              'calendar-day-empty': !date,
              'calendar-today': date === today,
            }"
          >
            <template v-if="date"
              ><button
                type="button"
                class="calendar-date"
                :aria-label="`Add Event on ${date}`"
                @click="create(date)"
              >
                {{ Number(date.slice(-2)) }}
              </button>
              <button
                v-for="event in byDate[date] || []"
                :key="event.key"
                type="button"
                class="calendar-event"
                :class="{ 'calendar-event-cancelled': event.cancelled }"
                @click="select(event)"
              >
                <strong
                  >{{ displayTime(event.time) }} ·
                  {{ locationName(event.locationId) }}</strong
                ><span>{{ event.title }}</span
                ><small v-if="event.cancelled">Cancelled</small
                ><small v-else-if="event.customized">Custom details</small>
              </button>
            </template>
          </div>
        </div>
      </div>
      <p class="editor-muted">
        Cancelled Events stay visible to visitors. All times are in Winnipeg.
      </p>
    </section>
    <aside
      v-if="draft"
      ref="panel"
      class="editor-panel event-panel"
      aria-label="Event details"
    >
      <div class="editor-panel-heading">
        <div>
          <p class="editor-eyebrow">
            {{ selected ? "EDIT EVENT" : "NEW EVENT" }}
          </p>
          <h2>
            {{
              selected
                ? locationName(selected.locationId)
                : "Plan a trivia Event"
            }}
          </h2>
        </div>
        <button type="button" aria-label="Close Event editor" @click="close">
          ×
        </button>
      </div>
      <form @submit.prevent="emit('publish')" class="editor-fields">
        <label for="event-title">Event title</label
        ><input id="event-title" v-model="draft.title" required />
        <template v-if="selected || draft.recurrence.type !== 'custom'"
          ><label for="event-date">{{
            !selected && draft.recurrence.type !== "once"
              ? "First date"
              : "Date"
          }}</label
          ><input id="event-date" v-model="eventDate" type="date" required
        /></template>
        <button
          v-if="customized('date')"
          type="button"
          class="editor-text-button"
          @click="reset('date')"
        >
          Use series date
        </button>
        <label for="event-time">Start time · Winnipeg</label
        ><input id="event-time" v-model="draft.time" type="time" required />
        <button
          v-if="customized('time')"
          type="button"
          class="editor-text-button"
          @click="reset('time')"
        >
          Use series time
        </button>
        <label for="event-location">Location</label
        ><select id="event-location" v-model="draft.locationId" required>
          <option value="" disabled>Choose a Location</option>
          <option
            v-for="location in selectableLocations"
            :key="location.id"
            :value="location.id"
          >
            {{ location.name }}{{ location.archived ? " (archived)" : "" }}
          </option>
        </select>
        <button
          v-if="customized('locationId')"
          type="button"
          class="editor-text-button"
          @click="reset('locationId')"
        >
          Use series Location
        </button>
        <button type="button" @click="addingLocation = !addingLocation">
          + Create a Location
        </button>
        <fieldset v-if="addingLocation" class="editor-card">
          <legend>New Location</legend>
          <label for="new-location-name">Name</label
          ><input id="new-location-name" v-model="newLocation.name" /><label
            for="new-location-address"
            >Address</label
          ><AdminAddressField
            id="new-location-address"
            v-model="newLocation.address"
            :maps-key="mapsKey"
            @place="newLocation.placeId = $event"
          /><button type="button" @click="addLocation">
            Use this Location
          </button>
        </fieldset>
        <template v-if="selected && isSeries">
          <label for="event-scope">Apply changes to</label
          ><select id="event-scope" v-model="scope">
            <option value="one">Only this Event</option>
            <option value="following">This and following Events</option>
            <option value="all">Entire series</option>
          </select>
          <p v-if="scope === 'all'" class="editor-note">
            Includes earlier dates. Individual custom times and Locations are
            preserved.
          </p>
        </template>
        <template v-if="!selected || !isSeries || scope !== 'one'">
          <label for="repeat-type">Repeats</label
          ><select
            id="repeat-type"
            :value="draft.recurrence.type"
            @change="changeRepeat(($event.target as HTMLSelectElement).value)"
          >
            <option value="once">Does not repeat</option>
            <option value="weekly">Every week / every few weeks</option>
            <option value="monthly">Monthly on a date</option>
            <option value="monthlyWeekday">Monthly on weekdays</option>
            <option value="custom">Hand-picked dates</option>
          </select>
          <template v-if="draft.recurrence.type === 'weekly'"
            ><label for="repeat-interval">Repeat every (weeks)</label
            ><input
              id="repeat-interval"
              v-model.number="draft.recurrence.interval"
              type="number"
              min="1"
              max="52"
            />
            <fieldset class="weekday-picker">
              <legend>On these days</legend>
              <label v-for="(day, index) in weekdays" :key="day"
                ><input
                  v-model="draft.recurrence.weekdays"
                  type="checkbox"
                  :value="index"
                />{{ day.slice(0, 3) }}</label
              >
            </fieldset></template
          >
          <template v-if="draft.recurrence.type === 'monthly'"
            ><label for="month-day">Day of the month</label
            ><input
              id="month-day"
              v-model.number="draft.recurrence.dayOfMonth"
              type="number"
              min="1"
              max="31"
            /><small>Months without this date are skipped.</small></template
          >
          <template v-if="draft.recurrence.type === 'monthlyWeekday'"
            ><label for="month-weekday">Weekday</label
            ><select
              id="month-weekday"
              v-model.number="draft.recurrence.weekday"
            >
              <option
                v-for="(day, index) in weekdays"
                :key="day"
                :value="index"
              >
                {{ day }}
              </option>
            </select>
            <fieldset class="weekday-picker">
              <legend>Which weeks?</legend>
              <label v-for="option in nthOptions" :key="option.value"
                ><input
                  v-model="draft.recurrence.nths"
                  type="checkbox"
                  :value="option.value"
                />{{ option.label }}</label
              >
            </fieldset>
            <small
              >A fifth weekday is skipped in months that do not have one.</small
            ></template
          >
          <template v-if="draft.recurrence.type === 'custom'"
            ><p>Choose each date for this series.</p>
            <div class="editor-inline">
              <input
                v-model="customDate"
                type="date"
                aria-label="Add a custom date"
              /><button type="button" @click="addCustomDate">Add date</button>
            </div>
            <div class="date-chips">
              <button
                v-for="date in draft.recurrence.dates"
                :key="date"
                type="button"
                @click="
                  draft.recurrence.dates = draft.recurrence.dates.filter(
                    (d: string) => d !== date,
                  )
                "
                :aria-label="`Remove ${date}`"
              >
                {{ date }} ×
              </button>
            </div></template
          >
          <template
            v-if="
              draft.recurrence.type !== 'once' &&
              draft.recurrence.type !== 'custom'
            "
            ><label for="schedule-end">Last date (optional)</label
            ><input
              id="schedule-end"
              v-model="draft.endDate"
              type="date"
            /><small>Leave empty to keep repeating.</small></template
          >
        </template>
        <p
          v-if="selected && (cancellation ?? selected.cancelled)"
          class="editor-note"
        >
          This Event is marked as cancelled and stays visible on the calendar.
          Save & publish to apply your changes.
        </p>
        <ul v-if="errors.length" class="editor-error" role="alert">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
        <button type="submit" class="editor-primary">Save &amp; publish</button>
        <button
          v-if="selected"
          type="button"
          :class="(cancellation ?? selected.cancelled) ? '' : 'editor-danger'"
          @click="toggleCancellation"
        >
          {{
            (cancellation ?? selected.cancelled)
              ? "Restore Event"
              : "Cancel Event"
          }}
        </button>
        <p v-if="selected && scope === 'all'" class="editor-note">
          Cancel or Restore also applies to earlier Events in this series.
        </p>
      </form>
    </aside>
  </div>
</template>
<script setup lang="ts">
import {
  expandEvents,
  resolveOccurrence,
  dateKey,
  parseDate,
  validDate,
  displayTime,
  editEvents,
  setCancellation,
  resetCustomization,
  validateRecord,
  type EventRecord,
  type Location,
  type Occurrence,
  type Scope,
  type EventEdit,
} from "~/utils/schedule";
const props = defineProps<{
    modelValue: EventRecord[];
    locations: Location[];
    mapsKey?: string;
  }>(),
  emit = defineEmits<{
    "update:modelValue": [events: EventRecord[]];
    "update:locations": [locations: Location[]];
    publish: [];
    editing: [value: boolean];
  }>();
const { date: now } = useWinnipegDate(),
  today = computed(() => dateKey(now.value)),
  month = ref(new Date(now.value.getFullYear(), now.value.getMonth(), 1));
const monthLabel = computed(() =>
  month.value.toLocaleDateString("en-CA", { month: "long", year: "numeric" }),
);
const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  nthOptions = [
    { value: 1, label: "1st" },
    { value: 2, label: "2nd" },
    { value: 3, label: "3rd" },
    { value: 4, label: "4th" },
    { value: 5, label: "5th" },
    { value: -1, label: "Last" },
  ];
const from = computed(() => dateKey(month.value)),
  to = computed(() =>
    dateKey(new Date(month.value.getFullYear(), month.value.getMonth() + 1, 0)),
  );
const occurrences = computed(() =>
    expandEvents(props.modelValue, from.value, to.value),
  ),
  byDate = computed(() => {
    const result: Record<string, Occurrence[]> = {};
    for (const item of occurrences.value) (result[item.date] ||= []).push(item);
    return result;
  });
const cells = computed(() => {
  const result: (string | null)[] = Array(month.value.getDay()).fill(null);
  for (let d = 1; d <= parseDate(to.value).getDate(); d++)
    result.push(
      dateKey(new Date(month.value.getFullYear(), month.value.getMonth(), d)),
    );
  while (result.length % 7) result.push(null);
  return result;
});
const panel = ref<HTMLElement>(),
  initialDraft = ref("");
const cancellation = ref<boolean | null>(null);
const draft = ref<EventRecord | null>(null),
  selected = ref<Occurrence | null>(null),
  eventDate = ref(""),
  scope = ref<Scope>("one"),
  customDate = ref(""),
  errors = ref<string[]>([]),
  addingLocation = ref(false),
  newLocation = reactive({ name: "", address: "", placeId: "" }),
  resets = ref<string[]>([]);
const fingerprint = () =>
  JSON.stringify({
    draft: draft.value,
    date: eventDate.value,
    resets: resets.value,
    cancellation: cancellation.value,
  });
const panelDirty = computed(
  () =>
    !!draft.value && (!selected.value || fingerprint() !== initialDraft.value),
);
watch(panelDirty, (value: boolean) => emit("editing", value));
function focusPanel() {
  nextTick(() => {
    if (window.matchMedia("(max-width:760px)").matches)
      panel.value?.scrollIntoView({ block: "start" });
    panel.value?.querySelector("input")?.focus({ preventScroll: true });
  });
}
const originalRecord = computed(() =>
    props.modelValue.find((r) => r.id === selected.value?.recordId),
  ),
  isSeries = computed(
    () =>
      originalRecord.value?.recurrence.type !== "once" ||
      props.modelValue.filter((r) => r.seriesId === selected.value?.seriesId)
        .length > 1,
  );
const selectableLocations = computed(() =>
  props.locations.filter(
    (l) => !l.archived || l.id === draft.value?.locationId,
  ),
);
const locationName = (id: string) =>
  props.locations.find((l) => l.id === id)?.name || "Choose a Location";
function moveMonth(n: number) {
  month.value = new Date(
    month.value.getFullYear(),
    month.value.getMonth() + n,
    1,
  );
}
function showToday() {
  month.value = new Date(now.value.getFullYear(), now.value.getMonth(), 1);
}
function select(item: Occurrence) {
  if (panelDirty.value && !confirm("Discard the changes in the Event panel?"))
    return;
  cancellation.value = null;
  selected.value = item;
  draft.value = JSON.parse(
    JSON.stringify(props.modelValue.find((r) => r.id === item.recordId)),
  );
  Object.assign(draft.value!, {
    title: item.title,
    time: item.time,
    locationId: item.locationId,
  });
  eventDate.value = item.date;
  scope.value = "one";
  errors.value = [];
  resets.value = [];
  initialDraft.value = fingerprint();
  focusPanel();
}
function create(date: string) {
  if (panelDirty.value && !confirm("Discard the changes in the Event panel?"))
    return;
  const id = crypto.randomUUID();
  cancellation.value = null;
  selected.value = null;
  draft.value = {
    id,
    seriesId: id,
    title: "Trivia Night",
    time: "19:00",
    locationId: "",
    startDate: date,
    recurrence: { type: "once", date },
    exceptions: {},
  };
  eventDate.value = date;
  scope.value = "one";
  errors.value = [];
  resets.value = [];
  initialDraft.value = fingerprint();
  focusPanel();
}
function close() {
  if (panelDirty.value && !confirm("Discard the changes in the Event panel?"))
    return;
  draft.value = null;
  selected.value = null;
  emit("editing", false);
}
function changeRepeat(type: string) {
  if (!draft.value) return;
  const date = eventDate.value || today.value,
    day = parseDate(date).getDay();
  draft.value.recurrence =
    type === "weekly"
      ? { type, weekdays: [day], interval: 1, anchor: date }
      : type === "monthly"
        ? { type, dayOfMonth: parseDate(date).getDate() }
        : type === "monthlyWeekday"
          ? {
              type,
              weekday: day,
              nths: [Math.ceil(parseDate(date).getDate() / 7)],
            }
          : type === "custom"
            ? { type, dates: [date] }
            : { type: "once", date };
}
function addCustomDate() {
  if (
    draft.value?.recurrence.type === "custom" &&
    validDate(customDate.value)
  ) {
    draft.value.recurrence.dates = [
      ...new Set([...draft.value.recurrence.dates, customDate.value]),
    ].sort();
    customDate.value = "";
  }
}
function addLocation() {
  if (!newLocation.name.trim() || !newLocation.address.trim()) {
    errors.value = ["Enter a Location name and address."];
    return;
  }
  const location: Location = {
    id: crypto.randomUUID(),
    name: newLocation.name.trim(),
    address: newLocation.address.trim(),
    placeId: newLocation.placeId,
    archived: false,
  };
  emit("update:locations", [...props.locations, location]);
  draft.value!.locationId = location.id;
  Object.assign(newLocation, { name: "", address: "", placeId: "" });
  addingLocation.value = false;
  errors.value = [];
}
function customized(field: string) {
  return (
    selected.value &&
    originalRecord.value?.exceptions[selected.value.originalDate]?.[
      field as "date"
    ] !== undefined &&
    !resets.value.includes(field)
  );
}
function reset(field: "date" | "time" | "locationId") {
  if (!draft.value || !originalRecord.value || !selected.value) return;
  resets.value.push(field);
  if (field === "date")
    eventDate.value = resolveOccurrence(
      { ...originalRecord.value, exceptions: {} },
      selected.value.originalDate,
    ).date;
  else draft.value[field] = originalRecord.value[field];
}
function applyEditor(): boolean {
  if (!draft.value) return true;
  if (!panelDirty.value) {
    draft.value = null;
    selected.value = null;
    emit("editing", false);
    return true;
  }
  errors.value = [];
  if (!validDate(eventDate.value)) {
    errors.value = ["Choose a valid Event date."];
    return false;
  }
  let result: EventRecord[];
  if (!selected.value || !isSeries.value) {
    const record: EventRecord = JSON.parse(JSON.stringify(draft.value));
    // A standalone Event can become a series beginning on its selected date.
    // Its current details become the defaults, without carrying an old date override.
    record.exceptions = {};
    delete record.dateShift;
    if (selected.value)
      record.cancelled = cancellation.value ?? selected.value.cancelled;
    if (record.recurrence.type === "once") {
      record.recurrence.date = eventDate.value;
      delete record.startDate;
      delete record.endDate;
    } else if (record.recurrence.type === "custom") {
      delete record.startDate;
      delete record.endDate;
    } else record.startDate = eventDate.value;
    result = selected.value
      ? props.modelValue.map((r) => (r.id === record.id ? record : r))
      : [...props.modelValue, record];
  } else {
    let input = props.modelValue;
    for (const field of resets.value)
      input = resetCustomization(
        input,
        selected.value,
        field as "date" | "time" | "locationId",
      );
    const changes: EventEdit = {};
    const baseline = resolveOccurrence(
      input.find((r) => r.id === selected.value!.recordId)!,
      selected.value.originalDate,
    );
    for (const field of ["title", "time", "locationId"] as const)
      if (draft.value[field] !== baseline[field])
        changes[field] = draft.value[field];
    if (eventDate.value !== baseline.date) changes.date = eventDate.value;
    if (scope.value !== "one") {
      if (
        JSON.stringify(draft.value.recurrence) !==
        JSON.stringify(originalRecord.value!.recurrence)
      ) {
        changes.recurrence = draft.value.recurrence;
        delete changes.date;
      }
      if ((draft.value.endDate || "") !== (originalRecord.value!.endDate || ""))
        changes.endDate = draft.value.endDate || "";
    }
    if (cancellation.value !== null)
      input = setCancellation(
        input,
        selected.value,
        scope.value,
        cancellation.value,
        () => crypto.randomUUID(),
      );
    result = editEvents(input, selected.value, scope.value, changes, () =>
      crypto.randomUUID(),
    );
  }
  errors.value = result.flatMap((r) => validateRecord(r, props.locations));
  if (errors.value.length) return false;
  emit("update:modelValue", result);
  draft.value = null;
  selected.value = null;
  emit("editing", false);
  return true;
}
function toggleCancellation() {
  if (selected.value)
    cancellation.value = !(cancellation.value ?? selected.value.cancelled);
}
defineExpose({ applyEditor });
</script>
