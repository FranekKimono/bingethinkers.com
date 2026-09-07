# A visual editor with shared page rendering and Git publishing

The admin uses Nuxt components for calendar and Location editing, and the actual public page components in an isolated preview for page editing. The six fixed pages now read structured JSON, including simple sanitized rich text and individual FAQ entries; the original Markdown is retained as a migration reference. Keeping a separate Decap preview and freeform Markdown would require maintaining two page renderings and would continue exposing formatting syntax to editors.

Publishing keeps the existing GitHub OAuth and Cloudflare deployment model. All changed content and uploaded images are committed atomically using a base tree and a non-forced branch update; a newer commit stops the save rather than overwriting someone else's work. This preserves the requested single Save & publish action without adding a separate database, authentication provider, or saved-draft service.

A series may contain multiple schedule records after a future-only edit. Records share a series ID; individual exceptions are keyed by their original calendar dates so moved Events, custom times, and cancellations survive later edits. Dates are interpreted as Winnipeg calendar dates, with times stored separately from timestamps. Repeat-pattern changes retain explicit exceptions on their existing dates so deliberate changes cannot silently disappear.

Locations have stable IDs. Name/address corrections affect all references; a physical move creates a new Location. Archive retains the record and its existing references.
