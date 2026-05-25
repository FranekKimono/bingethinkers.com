import eventsData from '~/data/events.json'

export type EventRecurrence =
  | { type: 'once'; date: string }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'monthly'; dayOfMonth: number }

export interface CalendarEvent {
  id: string
  title: string
  venue?: string
  time?: string
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

export function eventMatchesDate(event: CalendarEvent, date: Date): boolean {
  const { recurrence } = event
  if (recurrence.type === 'once') {
    return recurrence.date === formatDateKey(date)
  }
  if (recurrence.type === 'weekly') {
    return recurrence.dayOfWeek === date.getDay()
  }
  if (recurrence.type === 'monthly') {
    return recurrence.dayOfMonth === date.getDate()
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

  return results.sort((a, b) => a.date.getTime() - b.date.getTime())
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

export function getEventsTonight(date: Date = new Date()): DayEvent[] {
  const tonight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const results: DayEvent[] = []

  for (const event of getAllEvents()) {
    if (eventMatchesDate(event, tonight)) {
      results.push({ event, date: tonight })
    }
  }

  return results.sort((a, b) => {
    if (a.event.time && b.event.time) return a.event.time.localeCompare(b.event.time)
    if (a.event.time) return -1
    if (b.event.time) return 1
    return a.event.title.localeCompare(b.event.title)
  })
}

export function getNextEvent(fromDate: Date = new Date()): DayEvent | null {
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())

  for (let i = 0; i < 400; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    for (const event of getAllEvents()) {
      if (eventMatchesDate(event, date)) {
        return { event, date }
      }
    }
  }

  return null
}
