/** Calendar dates are local Winnipeg dates, never UTC timestamps. */
export interface Location {
  id: string;
  name: string;
  address: string;
  placeId?: string;
  archived: boolean;
}
export type Recurrence =
  | { type: "once"; date: string }
  | { type: "weekly"; weekdays: number[]; interval: number; anchor: string }
  | { type: "monthly"; dayOfMonth: number }
  | { type: "monthlyWeekday"; weekday: number; nths: number[] }
  | { type: "custom"; dates: string[] };
export interface EventException {
  date?: string;
  title?: string;
  time?: string;
  locationId?: string;
  cancelled?: boolean;
}
export interface EventRecord {
  id: string;
  seriesId: string;
  title: string;
  time: string;
  locationId: string;
  recurrence: Recurrence;
  startDate?: string;
  endDate?: string;
  dateShift?: number;
  cancelled?: boolean;
  exceptions: Record<string, EventException>;
}
export interface Occurrence {
  key: string;
  recordId: string;
  seriesId: string;
  originalDate: string;
  date: string;
  title: string;
  time: string;
  locationId: string;
  cancelled: boolean;
  customized: boolean;
}
export type Scope = "one" | "following" | "all";
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function parseDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function validDate(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseDate(key)) === key;
}
export function addDays(key: string, n: number): string {
  const d = parseDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}
export function daysBetween(a: string, b: string): number {
  const parts = (s: string) => s.split("-").map(Number);
  const x = parts(a),
    y = parts(b);
  return Math.round(
    (Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) /
      86400000,
  );
}
export function matches(rule: Recurrence, key: string): boolean {
  const d = parseDate(key);
  switch (rule.type) {
    case "once":
      return rule.date === key;
    case "custom":
      return rule.dates.includes(key);
    case "weekly": {
      const week = addDays(key, -d.getDay()),
        anchor = addDays(rule.anchor, -parseDate(rule.anchor).getDay());
      return (
        rule.weekdays.includes(d.getDay()) &&
        (daysBetween(anchor, week) / 7) % rule.interval === 0
      );
    }
    case "monthly":
      return d.getDate() === rule.dayOfMonth;
    case "monthlyWeekday":
      return (
        d.getDay() === rule.weekday &&
        (rule.nths.includes(Math.ceil(d.getDate() / 7)) ||
          (rule.nths.includes(-1) &&
            parseDate(addDays(key, 7)).getMonth() !== d.getMonth()))
      );
  }
}
function inBounds(record: EventRecord, key: string) {
  return (
    (!record.startDate || key >= record.startDate) &&
    (!record.endDate || key <= record.endDate)
  );
}
export function resolveOccurrence(
  record: EventRecord,
  originalDate: string,
): Occurrence {
  const special = record.exceptions[originalDate] || {};
  return {
    key: `${record.id}:${originalDate}`,
    recordId: record.id,
    seriesId: record.seriesId,
    originalDate,
    date: special.date ?? addDays(originalDate, record.dateShift || 0),
    title: special.title ?? record.title,
    time: special.time ?? record.time,
    locationId: special.locationId ?? record.locationId,
    cancelled: special.cancelled ?? record.cancelled ?? false,
    customized: Object.keys(special).some((k) => k !== "cancelled"),
  };
}
export function expandEvents(
  records: EventRecord[],
  from: string,
  to: string,
): Occurrence[] {
  const result: Occurrence[] = [];
  for (const record of records) {
    const candidates = new Set<string>();
    // Invert the series date shift so events moved across month boundaries are included.
    let start = addDays(from, -(record.dateShift || 0)),
      end = addDays(to, -(record.dateShift || 0));
    if (record.startDate && start < record.startDate) start = record.startDate;
    if (record.endDate && end > record.endDate) end = record.endDate;
    for (let key = start; key <= end; key = addDays(key, 1))
      if (matches(record.recurrence, key)) candidates.add(key);
    // Explicit exceptions stay attached, even outside the current month or a changed pattern.
    for (const key of Object.keys(record.exceptions))
      if (inBounds(record, key)) candidates.add(key);
    for (const key of candidates) {
      const item = resolveOccurrence(record, key);
      if (item.date >= from && item.date <= to) result.push(item);
    }
  }
  return result.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time) ||
      a.title.localeCompare(b.title) ||
      a.key.localeCompare(b.key),
  );
}
export function validateRecord(
  record: EventRecord,
  locations: Location[],
): string[] {
  const errors: string[] = [];
  if (!record.title.trim()) errors.push("Give the Event a title.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(record.time))
    errors.push("Choose a valid start time.");
  if (!locations.some((l) => l.id === record.locationId))
    errors.push("Choose a saved Location.");
  for (const key of [record.startDate, record.endDate])
    if (key && !validDate(key)) errors.push("Choose a valid schedule date.");
  if (record.startDate && record.endDate && record.endDate < record.startDate)
    errors.push("The end date must be on or after the start date.");
  const r = record.recurrence;
  if (r.type === "once" && !validDate(r.date))
    errors.push("Choose the Event date.");
  if (
    r.type === "weekly" &&
    (!r.weekdays.length ||
      r.weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
      !Number.isInteger(r.interval) ||
      r.interval < 1 ||
      r.interval > 52 ||
      !validDate(r.anchor))
  )
    errors.push(
      "Choose weekdays and a repeat interval between 1 and 52 weeks.",
    );
  if (
    r.type === "monthly" &&
    (!Number.isInteger(r.dayOfMonth) || r.dayOfMonth < 1 || r.dayOfMonth > 31)
  )
    errors.push("Choose a day from 1 to 31.");
  if (
    r.type === "monthlyWeekday" &&
    (!Number.isInteger(r.weekday) ||
      r.weekday < 0 ||
      r.weekday > 6 ||
      !r.nths.length ||
      r.nths.some((n) => ![-1, 1, 2, 3, 4, 5].includes(n)))
  )
    errors.push("Choose a weekday and which weeks of the month.");
  if (
    r.type === "custom" &&
    (!r.dates.length || r.dates.some((d) => !validDate(d)))
  )
    errors.push("Select at least one valid date.");
  if (record.dateShift !== undefined && !Number.isInteger(record.dateShift))
    errors.push("The date change is invalid.");
  for (const [key, value] of Object.entries(record.exceptions)) {
    if (!validDate(key) || (value.date !== undefined && !validDate(value.date)))
      errors.push("An individual Event has an invalid date.");
    if (
      value.time !== undefined &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
    )
      errors.push("An individual Event has an invalid time.");
    if (
      value.locationId !== undefined &&
      !locations.some((l) => l.id === value.locationId)
    )
      errors.push("An individual Event refers to a missing Location.");
  }
  return [...new Set(errors)];
}
export interface EventEdit {
  title?: string;
  time?: string;
  locationId?: string;
  date?: string;
  recurrence?: Recurrence;
  startDate?: string;
  endDate?: string;
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function scopedRecords(
  records: EventRecord[],
  occurrence: Occurrence,
  scope: Scope,
  newId: () => string,
): EventRecord[] {
  if (scope === "all")
    return records.filter((r) => r.seriesId === occurrence.seriesId);
  const selected = records.find((r) => r.id === occurrence.recordId)!;
  const targets: EventRecord[] = [];
  for (const record of [...records]) {
    if (
      record.seriesId !== selected.seriesId ||
      (record.endDate && record.endDate < occurrence.originalDate)
    )
      continue;
    if (record.startDate && record.startDate >= occurrence.originalDate) {
      targets.push(record);
      continue;
    }
    const next = clone(record);
    next.id = newId();
    next.startDate = occurrence.originalDate;
    next.exceptions = Object.fromEntries(
      Object.entries(record.exceptions).filter(
        ([date]) => date >= occurrence.originalDate,
      ),
    );
    record.endDate = addDays(occurrence.originalDate, -1);
    record.exceptions = Object.fromEntries(
      Object.entries(record.exceptions).filter(
        ([date]) => date < occurrence.originalDate,
      ),
    );
    records.push(next);
    targets.push(next);
  }
  return targets;
}
/** Returns new records; callers publish the complete schedule atomically. */
export function editEvents(
  input: EventRecord[],
  occurrence: Occurrence,
  scope: Scope,
  edit: EventEdit,
  newId: () => string,
): EventRecord[] {
  const records = clone(input),
    selected = records.find((r) => r.id === occurrence.recordId);
  if (!selected)
    throw new Error("This Event no longer exists. Reload the calendar.");
  if (!Object.keys(edit).length) return records;
  if (scope === "one") {
    const special = { ...selected.exceptions[occurrence.originalDate] };
    for (const field of ["title", "time", "locationId", "date"] as const)
      if (edit[field] !== undefined) special[field] = edit[field];
    selected.exceptions[occurrence.originalDate] = special;
  } else {
    const shift =
      edit.date === undefined
        ? undefined
        : daysBetween(occurrence.originalDate, edit.date);
    const targets = scopedRecords(records, occurrence, scope, newId).sort(
      (a, b) => (a.startDate || "").localeCompare(b.startDate || ""),
    );
    for (const record of targets) {
      for (const field of ["title", "time", "locationId"] as const)
        if (edit[field] !== undefined) record[field] = edit[field]!;
      if (shift !== undefined) record.dateShift = shift;
      if (edit.recurrence !== undefined) {
        record.recurrence = clone(edit.recurrence);
        record.dateShift = 0;
      }
      if (
        edit.startDate !== undefined &&
        scope === "all" &&
        record === targets[0]
      )
        record.startDate = edit.startDate || undefined;
      if (edit.endDate !== undefined) {
        const isLast = record === targets[targets.length - 1];
        if (
          edit.endDate &&
          record.startDate &&
          edit.endDate < record.startDate
        ) {
          records.splice(records.indexOf(record), 1);
          continue;
        }
        if (
          isLast ||
          (edit.endDate && (!record.endDate || edit.endDate < record.endDate))
        )
          record.endDate = edit.endDate || undefined;
      }
    }
  }
  return records;
}
export function setCancellation(
  input: EventRecord[],
  item: Occurrence,
  scope: Scope,
  cancelled: boolean,
  newId: () => string,
): EventRecord[] {
  const records = clone(input),
    selected = records.find((r) => r.id === item.recordId);
  if (!selected)
    throw new Error("This Event no longer exists. Reload the calendar.");
  if (scope === "one")
    selected.exceptions[item.originalDate] = {
      ...selected.exceptions[item.originalDate],
      cancelled,
    };
  else
    for (const record of scopedRecords(records, item, scope, newId)) {
      record.cancelled = cancelled;
      for (const special of Object.values(record.exceptions))
        delete special.cancelled;
    }
  return records;
}
export function resetCustomization(
  input: EventRecord[],
  item: Occurrence,
  field: "date" | "time" | "locationId" | "title",
): EventRecord[] {
  const records = clone(input),
    record = records.find((r) => r.id === item.recordId);
  if (record?.exceptions[item.originalDate]) {
    delete record.exceptions[item.originalDate][field];
    if (!Object.keys(record.exceptions[item.originalDate]).length)
      delete record.exceptions[item.originalDate];
  }
  return records;
}
export function displayTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
