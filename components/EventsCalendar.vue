<template>
  <div class="events-calendar">
    <div class="events-calendar__header">
      <button
        type="button"
        class="events-calendar__nav"
        aria-label="Previous month"
        @click="prevMonth"
      >
        ←
      </button>
      <h2 class="events-calendar__title">{{ monthLabel }}</h2>
      <button
        type="button"
        class="events-calendar__nav"
        aria-label="Next month"
        @click="nextMonth"
      >
        →
      </button>
    </div>

    <div class="events-calendar__grid">
      <div
        v-for="label in weekdayLabels"
        :key="label"
        class="events-calendar__weekday"
      >
        {{ label }}
      </div>

      <template v-for="(week, wi) in grid" :key="wi">
        <div
          v-for="(day, di) in week"
          :key="`${wi}-${di}`"
          class="events-calendar__cell"
          :class="{
            'events-calendar__cell--empty': day === null,
            'events-calendar__cell--today': isCurrentMonth && day === today,
            'events-calendar__cell--has-events': day !== null && eventsByDay[day]?.length,
            'events-calendar__cell--next': day !== null && isNextShowDay(day),
          }"
        >
          <span v-if="day !== null" class="events-calendar__day">{{ day }}</span>
          <ul v-if="day !== null && eventsByDay[day]?.length" class="events-calendar__events">
            <li
              v-for="item in eventsByDay[day]"
              :key="dayEventKey(item)"
              :class="{ 'events-calendar__event--next': isNextShow(item) }"
            >
              <span class="events-calendar__event-name">{{ item.event.title }}</span>
              <span v-if="item.event.time" class="events-calendar__event-time">{{ item.event.time }}</span>
              <VenueLink
                v-if="item.event.venue"
                :name="item.event.venue"
                link-class="events-calendar__event-venue"
              />
            </li>
          </ul>
        </div>
      </template>
    </div>

    <ul v-if="upcomingList.length" class="events-calendar__list">
      <li
        v-for="item in upcomingList"
        :key="dayEventKey(item)"
        :class="{ 'events-calendar__list-item--next': isNextShow(item) }"
      >
        <time :datetime="formatDateKey(item.date)">
          {{ item.date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) }}
        </time>
        <span>{{ item.event.title }}</span>
        <span v-if="item.event.time" class="events-calendar__list-time">{{ item.event.time }}</span>
        <VenueLink
          v-if="item.event.venue"
          :name="item.event.venue"
          link-class="events-calendar__list-venue"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  getCalendarGrid,
  getEventsForMonth,
  getEventsOnDay,
  getMonthLabel,
  getNextEvent,
  getWeekdayLabels,
  formatDateKey,
  dayEventKey,
  type DayEvent,
} from '~/utils/events'

const now = new Date()
const today = now.getDate()

const displayDate = ref(new Date(now.getFullYear(), now.getMonth(), 1))

const year = computed(() => displayDate.value.getFullYear())
const month = computed(() => displayDate.value.getMonth())

const isCurrentMonth = computed(
  () => year.value === now.getFullYear() && month.value === now.getMonth(),
)

const monthLabel = computed(() => getMonthLabel(year.value, month.value))
const weekdayLabels = getWeekdayLabels()
const grid = computed(() => getCalendarGrid(year.value, month.value))
const monthEvents = computed(() => getEventsForMonth(year.value, month.value))

const eventsByDay = computed(() => {
  const map: Record<number, DayEvent[]> = {}
  for (let day = 1; day <= 31; day++) {
    const onDay = getEventsOnDay(monthEvents.value, year.value, month.value, day)
    if (onDay.length) map[day] = onDay
  }
  return map
})

const upcomingList = computed(() => {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (isCurrentMonth.value) {
    return monthEvents.value.filter((e) => e.date >= startOfToday)
  }
  return monthEvents.value
})

const nextShow = computed(() => getNextEvent(now))
const nextShowKey = computed(() => (nextShow.value ? dayEventKey(nextShow.value) : null))

function isNextShow(item: DayEvent): boolean {
  return nextShowKey.value === dayEventKey(item)
}

function isNextShowDay(day: number): boolean {
  if (!nextShow.value) return false
  const d = nextShow.value.date
  return d.getFullYear() === year.value && d.getMonth() === month.value && d.getDate() === day
}

function prevMonth() {
  displayDate.value = new Date(year.value, month.value - 1, 1)
}

function nextMonth() {
  displayDate.value = new Date(year.value, month.value + 1, 1)
}
</script>

<style scoped>
.events-calendar {
  width: 100%;
}

.events-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.events-calendar__title {
  font-size: var(--text-subsection);
  margin: 0;
  text-align: center;
  flex: 1;
}

.events-calendar__nav {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.5rem 0.85rem;
  transition: border-color 0.2s, color 0.2s;
}

.events-calendar__nav:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.events-calendar__nav:focus-visible {
  border-color: var(--color-highlight);
  outline-color: var(--color-highlight);
}

.events-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.events-calendar__weekday {
  background: var(--color-surface);
  padding: 0.6rem 0.25rem;
  text-align: center;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.events-calendar__cell {
  background: var(--color-bg);
  min-height: 100px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.events-calendar__cell--empty {
  background: var(--color-surface);
  opacity: 0.4;
}

.events-calendar__cell--today .events-calendar__day {
  background: var(--color-accent-button);
  color: var(--color-text-inverse);
}

.events-calendar__cell--has-events {
  background: var(--color-surface);
}

.events-calendar__cell--next {
  background: var(--color-primary-tint);
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.events-calendar__event--next .events-calendar__event-name {
  color: var(--color-highlight);
}

.events-calendar__event--next .events-calendar__event-venue {
  color: var(--color-highlight-muted);
}

.events-calendar__day {
  align-self: flex-start;
  font-size: var(--text-sm);
  font-weight: 600;
  width: 1.6rem;
  height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.events-calendar__events {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.events-calendar__events li {
  margin-bottom: 0.2rem;
}

.events-calendar__event-name {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}

.events-calendar__event-time {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-accent);
  line-height: 1.2;
}

.events-calendar__event-venue {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: 1.2;
}

.events-calendar__list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.events-calendar__list li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: baseline;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-base);
}

.events-calendar__list time {
  color: var(--color-accent);
  font-weight: 600;
  min-width: 7rem;
}

.events-calendar__list-time {
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
}

.events-calendar__list-venue {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.events-calendar__list-item--next {
  background: var(--color-primary-tint-soft);
  border-radius: var(--radius);
  padding: 0.6rem 0.75rem !important;
  margin: 0 -0.75rem;
  border-bottom-color: transparent !important;
}

.events-calendar__list-item--next time {
  color: var(--color-highlight);
}

@media (max-width: 640px) {
  .events-calendar__cell {
    min-height: 56px;
    padding: 0.25rem;
  }

  .events-calendar__event-name,
  .events-calendar__event-time,
  .events-calendar__event-venue {
    display: none;
  }

  .events-calendar__cell--has-events .events-calendar__day::after {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    background: var(--color-accent);
    border-radius: 50%;
    margin: 2px auto 0;
  }

  .events-calendar__cell--next {
    box-shadow: inset 0 0 0 2px var(--color-primary);
  }

  .events-calendar__cell--next .events-calendar__day::after {
    background: var(--color-highlight);
    width: 6px;
    height: 6px;
  }
}
</style>
