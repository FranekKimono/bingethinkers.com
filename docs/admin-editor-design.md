# Admin editor redesign

Status: implemented; automated tests, TypeScript checking, and production build passed.

## Requested outcome

The admin should be usable by people without programming experience.

- Edit the event schedule through a calendar: click a date to add an Event and click an existing entry to change it.
- Create weekly repeats and custom schedules, and change event times and locations.
- Create reusable locations that can be selected when adding Events.
- Edit page copy visually by viewing a page and clicking the section to edit.

## Original behavior before this redesign

- The public calendar supports individual dates, weekly repeats, monthly dates, and numbered weekdays such as the second Tuesday. Its model also supports date bounds and exclusions, but the admin does not expose exclusions.
- The admin presents event records as a nested form with manually entered IDs and free-text dates and times. There is no calendar editing surface or linked override for one date in a repeating schedule.
- Existing schedules include Kilter's second and fourth Tuesdays, separate seasonal schedules for Rec Room, and individually selected dates for Smitty's. These are useful acceptance scenarios for the redesign.
- A separate venue address lookup exists, but the admin cannot manage or select these records. Events also store their own names and addresses, and those copies have already diverged from the lookup.
- Six fixed pages are editable: Home, Testimonials, Book & Contact, Our Story, FAQ, and Privacy Policy. The admin has no page-specific interactive preview. Some copy still requires formatting syntax, including raw HTML for FAQ items.
- Current saves commit to the deployment's Git branch and trigger a site rebuild.

The original implementation was reviewed in the former `public/admin/` Decap files, Event and venue data, calendar utilities, page components, and content files. The former admin files and duplicate venue lookup were replaced during implementation; their original versions remain in Git history. Current source locations and the publishing design are documented in [the implementation decision](adr/0001-visual-admin-content.md).

## Confirmed decisions

### Public schedule only

The redesigned calendar manages only Events displayed on the public website. Private Client bookings and Host assignment are outside this redesign. This preserves the distinction between the broader hosted-event business and the public schedule.

### Editing a repeating schedule

When changing the date, time, or location of an Event in a series, the editor offers all three scopes:

- **Only this Event**: change the selected dated Event while keeping it associated with its series.
- **This and following Events**: change the selected Event and subsequent Events in the series, leaving earlier Events unchanged.
- **Entire series**: change all Events in the series, including earlier dates.

Acceptance example: Rec Room's current fall schedule runs on Tuesdays from September 15 through November 17, 2026, at 7:00 PM. Changing October 6 to 7:30 PM affects October 6 only, October 6 through November 17, or September 15 through November 17, respectively. The separate summer schedule is outside this fall series.

The same scopes apply to cancellation and restoration, as described below.

### Preserving individual customizations

Series edits preserve the date, time, or location explicitly customized for an individual Event. Each other value continues to follow the series. The Event editor provides a way to reset each customized value to the series default.

Acceptance example: October 6 has been changed individually from 7:00 PM to 8:00 PM. A later series change to 7:30 PM leaves October 6 at 8:00 PM while updating the other affected Events. A series location change still applies to October 6 unless its location was also customized. Resetting October 6 to the series time makes it follow the current 7:30 PM default and subsequent series time changes.

### Supported schedules

The calendar editor supports:

- Every week or every chosen number of weeks, on selected weekdays.
- Monthly dates such as the 15th.
- Monthly weekday patterns such as the second and fourth Tuesdays, or the last Friday.
- Hand-picked dates selected with the date picker in the Event panel.
- Optional start and end dates for seasonal schedules.

These choices cover Kilter's second and fourth Tuesdays, Rec Room's seasonal weekly schedules, and Smitty's individually selected dates. One-time Events remain supported as requested in the original calendar workflow.

### Public visibility of cancellations

Cancelled Events remain visible on the public calendar with a clear **Cancelled** label. Cancelling an Event does not remove its public listing.

Acceptance example: cancelling Rec Room on October 6 leaves an entry on October 6 displaying its scheduled time and Location together with the Cancelled label, so visitors can tell that the Event will not take place.

Derived acceptance criteria: cancellation must be readable in the calendar grid and mobile list without relying on color alone. Cancelled Events must not be promoted by the site's Tonight, Next, or Upcoming invitations or highlighted as the next Event; those surfaces select the next Event that is taking place.

### Cancelling and restoring Events

Both **Cancel** and **Restore** offer Only this Event, This and following Events, and Entire series. The default scope is Only this Event. Cancelling an entire series also marks its earlier Events as cancelled; restoring an entire series removes the cancellation status across that series.

Cancellation and restoration change the status within the selected scope while preserving the Events' date, time, and Location customizations. Restore makes an Event active again without requiring the administrator to recreate it.

Acceptance example: cancelling only Rec Room on October 6 leaves the other dates active. Restoring October 6 removes its Cancelled label and retains its custom 8:00 PM time, if one was set. It becomes eligible for Tonight, Next, and Upcoming invitations again when appropriate for its date.

### Reusable Locations

As requested in the original brief, an administrator can create a named Location with an address and select it from a saved list when creating another Event. Multiple Events and series may use the same Location.

Correcting a saved Location's name or address updates every Event using that Location, including past Events. If a venue actually moves to a different physical place, the administrator creates a new Location and applies it to the relevant Events using Only this Event, This and following Events, or Entire series.

Acceptance examples: correcting a spelling error in a saved Location's name fixes it on every linked Event. If a venue moves in October, create its new Location and assign it with This and following Events from the first Event at the new address; earlier Events retain the original Location.

An Event with a custom Location continues to use that chosen Location when its series changes Location. Corrections to the chosen Location's own name or address still reach that Event, because they correct the shared place rather than replacing the Event's Location choice.

### Archiving and reusing Locations

Saved Locations are retained for future reuse. **Archive** hides a Location from the picker for new Events while preserving it on existing Events. **Restore** makes it available for selection again.

Archiving a Location does not cancel or move existing Events, including already scheduled future Events. Those Events remain active until separately moved or cancelled.

Acceptance example: after archiving a Location that is no longer used, past Events still show its name and address. If Events resume there later, the administrator restores and selects the same saved Location without re-entering its details.

### Visual editing with fixed page layouts

The page editor retains the existing page layouts. Administrators view a page, click a section to edit its content, and immediately see their changes in the preview. They cannot add, remove, or reorder entire page sections.

Individual FAQ entries and testimonials can still be added or removed within their existing sections.

### Section editing panel

Clicking a section opens a simple editing panel beside the page preview. Text editing, image selection, and button settings use this panel consistently, and changes appear immediately in the preview.

Acceptance example: clicking the Home page's introductory section opens its content controls. Editing its heading updates that same section in the preview without requiring the administrator to locate a field elsewhere in a long form. Clicking another editable section changes the panel to that section's controls.

### Editable page content

Administrators can edit the following content within the fixed layouts:

- Page text, including headings and paragraphs.
- Images.
- Button labels and destinations.
- Individual FAQ entries and testimonials.

This expands the editor beyond the content fields currently exposed by the admin; the fixed-layout decision still applies.

Derived acceptance criteria: administrators can edit this content without writing Markdown or HTML. FAQ entries expose ordinary question and answer controls, and text formatting uses visible controls rather than requiring formatting syntax.

### Shared header and footer

The shared header and footer are outside the editor's editable content. Their logo, navigation labels and destinations, and footer wording and links remain managed in the site code.

The page preview still shows these shared areas for context, but they do not open editing controls. The header's Event announcement continues to reflect calendar data; editing an Event does not require editing the header itself.

### Save and publish

The editor uses a single **Save & publish** action. Administrators can inspect their changes in the editor preview before using that action; there is no separate Save draft step.

With the current deployment workflow, saving commits the edits to the environment's configured branch and starts a site rebuild. The public site reflects the changes after that deployment succeeds, rather than immediately when the save finishes. Preview environments continue to publish to their own preview branch.

Derived acceptance criteria: distinguish unsaved changes, saving, save success, and failure in plain language. A successful save must not be described as already live while a deployment is still pending, and a failed save must leave the administrator's edits available for correction or retry.

### Page settings

Each page has an optional Page settings panel for its search title and description. Existing values are retained unless an administrator changes them.

Confirmed terminology belongs in `CONTEXT.md`.

## Implementation and verification

The calendar, reusable Location controls, and six-page visual editor are implemented in the Nuxt `/admin/` route. [The architecture decision](adr/0001-visual-admin-content.md) records the content migration, shared rendering, and atomic Git publishing design.

- All 481 original public Event occurrences in 2026–2027 retain their dates, titles, times, venue names, and addresses after migration.
- Eighteen automated tests cover recurrence patterns, daylight-saving boundaries, scoped edits, retained customizations, cancellation/restoration, input sanitization, and atomic publishing with concurrent-edit protection.
- Vue/TypeScript checking and the production build pass. The build also verifies that the contact and OAuth Worker routes remain present.
- Browser checks cover calendar changes, converting a one-time Event to weekly repeats, cancellation labels, immediate page previews, selecting and uploading images, FAQ entry creation, archiving/restoring Locations, and the mobile editor panel.

Real GitHub authentication and publishing have not been exercised against the live repository. Publishing behavior is covered by mocked GitHub API tests; deployment remains a separate release step. The local demonstration at `/admin/?demo=1` runs only in development and cannot publish.
