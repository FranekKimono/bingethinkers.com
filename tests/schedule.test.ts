import test from "node:test";
import assert from "node:assert/strict";
import {
  expandEvents,
  editEvents,
  setCancellation,
  resetCustomization,
  validateRecord,
  type EventRecord,
  type Location,
  type Occurrence,
} from "../utils/schedule.ts";
const locations: Location[] = [
  {
    id: "rec",
    name: "Rec Room",
    address: "696 Sterling Lyon Pkwy",
    archived: false,
  },
  {
    id: "other",
    name: "Other place",
    address: "1 Main Street",
    archived: false,
  },
];
const rec = (): EventRecord => ({
  id: "fall",
  seriesId: "fall",
  title: "Trivia Night",
  time: "19:00",
  locationId: "rec",
  startDate: "2026-09-15",
  endDate: "2026-11-17",
  recurrence: {
    type: "weekly",
    weekdays: [2],
    interval: 1,
    anchor: "2026-09-15",
  },
  exceptions: {},
});
let sequence = 0;
const id = () => `segment-${++sequence}`;
const at = (events: EventRecord[], date: string): Occurrence => {
  const item = expandEvents(events, date, date)[0];
  assert.ok(item, `Expected an Event on ${date}`);
  return item;
};
test("second/fourth Tuesday and last Friday are calendar patterns, not every other week", () => {
  const r = {
    ...rec(),
    startDate: undefined,
    endDate: undefined,
    recurrence: { type: "monthlyWeekday" as const, weekday: 2, nths: [2, 4] },
  };
  assert.deepEqual(
    expandEvents([r], "2026-09-01", "2026-10-31").map((e) => e.date),
    ["2026-09-08", "2026-09-22", "2026-10-13", "2026-10-27"],
  );
  r.recurrence = { type: "monthlyWeekday", weekday: 5, nths: [4, -1] };
  assert.deepEqual(
    expandEvents([r], "2026-02-01", "2026-02-28").map((e) => e.date),
    ["2026-02-27"],
  );
});
test("biweekly schedules stay anchored across DST and year boundaries", () => {
  const r = {
    ...rec(),
    startDate: "2026-10-20",
    endDate: undefined,
    recurrence: {
      type: "weekly" as const,
      weekdays: [2, 4],
      interval: 2,
      anchor: "2026-10-20",
    },
  };
  assert.deepEqual(
    expandEvents([r], "2026-10-20", "2026-11-20").map((e) => e.date),
    [
      "2026-10-20",
      "2026-10-22",
      "2026-11-03",
      "2026-11-05",
      "2026-11-17",
      "2026-11-19",
    ],
  );
});
test("monthly 31st skips months without that date; selected dates are unique", () => {
  const r = {
    ...rec(),
    startDate: undefined,
    endDate: undefined,
    recurrence: { type: "monthly" as const, dayOfMonth: 31 },
  };
  assert.deepEqual(
    expandEvents([r], "2026-01-01", "2026-04-30").map((e) => e.date),
    ["2026-01-31", "2026-03-31"],
  );
  assert.equal(
    expandEvents(
      [
        {
          ...r,
          recurrence: {
            type: "custom",
            dates: ["2026-02-01", "2026-02-01", "2026-02-09"],
          },
        },
      ],
      "2026-02-01",
      "2026-02-28",
    ).length,
    2,
  );
});
test("only this Event changes one occurrence and following changes retain earlier history", () => {
  const initial = [rec()],
    oct6 = at(initial, "2026-10-06");
  const single = editEvents(initial, oct6, "one", { time: "20:00" }, id);
  assert.equal(at(single, "2026-10-06").time, "20:00");
  assert.equal(at(single, "2026-10-13").time, "19:00");
  assert.equal(initial[0].exceptions["2026-10-06"], undefined);
  const changed = editEvents(
    single,
    at(single, "2026-09-29"),
    "following",
    { time: "19:30", locationId: "other" },
    id,
  );
  assert.equal(at(changed, "2026-09-22").time, "19:00");
  assert.equal(at(changed, "2026-09-29").time, "19:30");
  assert.equal(at(changed, "2026-10-06").time, "20:00");
  assert.equal(at(changed, "2026-10-06").locationId, "other");
  assert.equal(expandEvents(changed, "2026-09-01", "2026-11-30").length, 10);
  const all = editEvents(
    changed,
    at(changed, "2026-10-13"),
    "all",
    { time: "18:00" },
    id,
  );
  assert.equal(at(all, "2026-09-15").time, "18:00");
  assert.equal(at(all, "2026-10-06").time, "20:00");
  const reset = resetCustomization(all, at(all, "2026-10-06"), "time");
  assert.equal(at(reset, "2026-10-06").time, "18:00");
});
test("moved Events appear exactly once across month boundaries and retain original identity", () => {
  const initial = [rec()],
    item = at(initial, "2026-09-29");
  const changed = editEvents(initial, item, "one", { date: "2026-10-01" }, id);
  assert.equal(expandEvents(changed, "2026-09-29", "2026-09-29").length, 0);
  const moved = at(changed, "2026-10-01");
  assert.equal(moved.originalDate, "2026-09-29");
  const next = editEvents(changed, moved, "all", { date: "2026-10-02" }, id);
  assert.equal(at(next, "2026-10-01").originalDate, "2026-09-29");
  assert.ok(
    expandEvents(next, "2026-09-01", "2026-11-30").some(
      (e) => e.date === "2026-10-09",
    ),
  );
});
test("Cancel and Restore apply explicit scopes and preserve customized fields", () => {
  let records = editEvents(
    [rec()],
    at([rec()], "2026-10-06"),
    "one",
    { time: "20:00", locationId: "other" },
    id,
  );
  records = setCancellation(
    records,
    at(records, "2026-10-06"),
    "one",
    true,
    id,
  );
  assert.equal(at(records, "2026-10-06").cancelled, true);
  assert.equal(at(records, "2026-10-13").cancelled, false);
  records = setCancellation(
    records,
    at(records, "2026-10-13"),
    "all",
    true,
    id,
  );
  assert.equal(at(records, "2026-09-15").cancelled, true);
  records = setCancellation(
    records,
    at(records, "2026-10-06"),
    "following",
    false,
    id,
  );
  assert.equal(at(records, "2026-09-29").cancelled, true);
  assert.equal(at(records, "2026-10-06").cancelled, false);
  assert.equal(at(records, "2026-10-06").time, "20:00");
  assert.equal(at(records, "2026-10-06").locationId, "other");
});
test("saved Locations remain valid when archived; impossible dates and missing places cannot save", () => {
  assert.deepEqual(
    validateRecord(rec(), [{ ...locations[0], archived: true }]),
    [],
  );
  assert.ok(
    validateRecord({ ...rec(), locationId: "missing" }, locations).length,
  );
  assert.ok(
    validateRecord(
      { ...rec(), recurrence: { type: "once", date: "2026-02-30" } },
      locations,
    ).length,
  );
  assert.ok(validateRecord({ ...rec(), time: "25:00" }, locations).length);
});
test("extending the end date after a future edit does not create duplicate earlier segments", () => {
  let records = editEvents(
    [rec()],
    at([rec()], "2026-10-06"),
    "following",
    { time: "20:00" },
    id,
  );
  records = editEvents(
    records,
    at(records, "2026-10-13"),
    "all",
    { endDate: "2026-12-01" },
    id,
  );
  const oct6 = expandEvents(records, "2026-10-06", "2026-10-06");
  assert.equal(oct6.length, 1);
  assert.equal(at(records, "2026-12-01").time, "20:00");
});

test("changing a repeat pattern uses the chosen weekdays after a previous series date shift", () => {
  const initial = [rec()];
  let records = editEvents(
    initial,
    at(initial, "2026-10-06"),
    "all",
    { date: "2026-10-07" },
    id,
  );
  records = editEvents(
    records,
    at(records, "2026-10-07"),
    "all",
    {
      recurrence: {
        type: "weekly",
        weekdays: [4],
        interval: 1,
        anchor: "2026-09-17",
      },
    },
    id,
  );
  assert.deepEqual(
    expandEvents(records, "2026-10-01", "2026-10-15").map((e) => e.date),
    ["2026-10-01", "2026-10-08", "2026-10-15"],
  );
});
test("opening a future Event without changes does not split its series", () => {
  const initial = [rec()];
  assert.deepEqual(
    editEvents(initial, at(initial, "2026-10-06"), "following", {}, id),
    initial,
  );
});
test("cancelling while shortening a series keeps earlier Events and removes later dates", () => {
  const initial = [rec()],
    item = at(initial, "2026-10-20");
  let records = setCancellation(initial, item, "all", true, id);
  records = editEvents(records, item, "all", { endDate: "2026-10-01" }, id);
  assert.equal(at(records, "2026-09-29").cancelled, true);
  assert.deepEqual(expandEvents(records, "2026-10-02", "2026-11-30"), []);
});
