import eventsData from '~/data/events.json'

export type EventRecurrence =
  | { type: 'once'; date: string }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'monthlyWeekday'; dayOfWeek: number; nth: number }

export interface EventLocation {
  address: string
  placeId?: string
  mapsUrl?: string
}

export interface CalendarEvent {
  id: string
  title: string
  venue?: string
  location?: EventLocation
  time?: string
  excludeDates?: string[]
  recurrence: EventRecurrence
}

export interface DayEvent {
  event: CalendarEvent
  date: Date
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function getAllEvents(): CalendarEvent[] {
  return eventsData.events as CalendarEvent[]
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isNthWeekdayOfMonth(date: Date, dayOfWeek: number, nth: number): boolean {
  if (date.getDay() !== dayOfWeek) return false

  let count = 0
  for (let day = 1; day <= date.getDate(); day++) {
    if (new Date(date.getFullYear(), date.getMonth(), day).getDay() === dayOfWeek) {
      count++
    }
  }

  return count === nth
}

export function eventMatchesDate(event: CalendarEvent, date: Date): boolean {
  const dateKey = formatDateKey(date)
  if (event.excludeDates?.includes(dateKey)) return false

  const { recurrence } = event
  if (recurrence.type === 'once') {
    return recurrence.date === dateKey
  }
  if (recurrence.type === 'weekly') {
    return recurrence.dayOfWeek === date.getDay()
  }
  if (recurrence.type === 'monthly') {
    return recurrence.dayOfMonth === date.getDate()
  }
  if (recurrence.type === 'monthlyWeekday') {
    return isNthWeekdayOfMonth(date, recurrence.dayOfWeek, recurrence.nth)
  }
  return false
}

export function getEventsForMonth(year: number, month: number): DayEvent[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const results: DayEvent[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    for (const event of getAllEvents()) {
      if (eventMatchesDate(event, date)) {
        results.push({ event, date })
      }
    }
  }

  return results.sort(compareDayEvents)
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-CA', {
    month: 'long',
    year: 'numeric',
  })
}

export function getWeekdayLabels(): string[] {
  return WEEKDAYS
}

export function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function getEventsOnDay(
  dayEvents: DayEvent[],
  year: number,
  month: number,
  day: number,
): DayEvent[] {
  return dayEvents.filter(
    (e) =>
      e.date.getFullYear() === year
      && e.date.getMonth() === month
      && e.date.getDate() === day,
  )
}

export function dayEventKey(item: DayEvent): string {
  return `${item.event.id}:${formatDateKey(item.date)}`
}

function getTimeSortValue(time?: string): number {
  if (!time) return Number.MAX_SAFE_INTEGER

  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!match) return Number.MAX_SAFE_INTEGER

  const hour = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const period = match[3].toUpperCase()
  const normalizedHour = (hour % 12) + (period === 'PM' ? 12 : 0)

  return normalizedHour * 60 + minutes
}

export function compareDayEvents(a: DayEvent, b: DayEvent): number {
  const dateDiff = a.date.getTime() - b.date.getTime()
  if (dateDiff !== 0) return dateDiff

  const timeDiff = getTimeSortValue(a.event.time) - getTimeSortValue(b.event.time)
  if (timeDiff !== 0) return timeDiff

  const venueDiff = (a.event.venue ?? '').localeCompare(b.event.venue ?? '')
  if (venueDiff !== 0) return venueDiff

  return a.event.title.localeCompare(b.event.title)
}

export function getEventsTonight(date: Date = new Date()): DayEvent[] {
  const tonight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const results: DayEvent[] = []

  for (const event of getAllEvents()) {
    if (eventMatchesDate(event, tonight)) {
      results.push({ event, date: tonight })
    }
  }

  return results.sort(compareDayEvents)
}

export function getUpcomingEvents(fromDate: Date = new Date(), limit = 8): DayEvent[] {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const results: DayEvent[] = []

  for (let i = 0; i < 400 && results.length < limit; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)

    const dayMatches = getAllEvents()
      .filter((event) => eventMatchesDate(event, date))
      .map((event) => ({ event, date }))
      .sort(compareDayEvents)

    results.push(...dayMatches)
  }

  return results.slice(0, limit)
}

export function getNextEvent(fromDate: Date = new Date()): DayEvent | null {
  return getUpcomingEvents(fromDate, 1)[0] ?? null
}
