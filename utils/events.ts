import eventsData from "~/data/events.json";
import locationsData from "~/data/locations.json";
import {
  expandEvents,
  displayTime,
  dateKey,
  type EventRecord,
  type Location,
  type Occurrence,
} from "./schedule";
export type CalendarEvent = ReturnType<typeof publicEvent>;
export interface DayEvent {
  event: CalendarEvent;
  date: Date;
  originalDate: string;
  recordId: string;
}
const records = eventsData.events as EventRecord[];
const locations = locationsData.locations as Location[];
function publicEvent(item: Occurrence) {
  const location = locations.find((l) => l.id === item.locationId);
  return {
    id: item.recordId,
    title: item.title,
    time: displayTime(item.time),
    venue: location?.name || "",
    location: location
      ? { address: location.address, placeId: location.placeId }
      : undefined,
    cancelled: item.cancelled,
  };
}
function dayEvents(from: string, to: string): DayEvent[] {
  return expandEvents(records, from, to).map((item) => {
    const [y, m, d] = item.date.split("-").map(Number);
    return {
      event: publicEvent(item),
      date: new Date(y, m - 1, d),
      originalDate: item.originalDate,
      recordId: item.recordId,
    };
  });
}
export const formatDateKey = dateKey;
export function getAllEvents() {
  return records;
}
export function getEventsForMonth(year: number, month: number): DayEvent[] {
  return dayEvents(
    dateKey(new Date(year, month, 1)),
    dateKey(new Date(year, month + 1, 0)),
  );
}
export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });
}
export function getWeekdayLabels(): string[] {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}
export function getCalendarGrid(
  year: number,
  month: number,
): (number | null)[][] {
  const cells: (number | null)[] = Array(
    new Date(year, month, 1).getDay(),
  ).fill(null);
  for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++)
    cells.push(d);
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
}
export function getEventsOnDay(
  events: DayEvent[],
  year: number,
  month: number,
  day: number,
) {
  return events.filter(
    (e) =>
      e.date.getFullYear() === year &&
      e.date.getMonth() === month &&
      e.date.getDate() === day,
  );
}
export function dayEventKey(item: DayEvent): string {
  return `${item.recordId}:${item.originalDate}`;
}
export function getEventsTonight(date = new Date()): DayEvent[] {
  const key = dateKey(date);
  return dayEvents(key, key).filter((e) => !e.event.cancelled);
}
export function getUpcomingEvents(date = new Date(), limit = 8): DayEvent[] {
  const end = new Date(date);
  end.setDate(end.getDate() + 400);
  return dayEvents(dateKey(date), dateKey(end))
    .filter((e) => !e.event.cancelled)
    .slice(0, limit);
}
export function getNextEvent(date = new Date()): DayEvent | null {
  return getUpcomingEvents(date, 1)[0] || null;
}
