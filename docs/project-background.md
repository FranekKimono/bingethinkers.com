# Project background

These notes were moved from `CONTEXT.md` so that it remains a domain glossary. The admin redesign discussion is recorded in [admin-editor-design.md](admin-editor-design.md).

## Architecture

**Site**: Nuxt 3 with a visual admin editor and JSON content published through GitHub. `@nuxt/content` remains available for the fallback prose route; the six fixed pages use `data/pages.json`. Deployed to Cloudflare Pages with a Worker for server routes.

**Contact form**: Nuxt Nitro API route (`/api/contact`) deployed as part of the Cloudflare Worker. Submissions are emailed via Resend when `RESEND_API_KEY` is configured; see the README for setup.

**Content model**: `/admin/` provides Calendar, Locations, and Pages. Schedules and exceptions live in `data/events.json`, shared places in `data/locations.json`, and the six fixed pages in `data/pages.json`. Original Markdown is retained as a migration reference.

**Color scheme**: Dark theme derived from `coming-soon.jpg` — warm off-black `#06030a` (never pure `#000`), deep purple `#480a77`, hot pink accent `#e85298`. Buttons use a darker `--color-accent-button` for WCAG contrast; inline links use `--color-link`. All dark surfaces use purple-tinted off-blacks layered as `--color-bg` → `--color-surface` → `--color-border`. Tokens and focus rings live in `assets/css/main.css`.

## Earlier business discussion

This discussion describes the broader hosting service. Private bookings and Host assignment are outside the public calendar editor redesign.

> **Dev:** When a Client books, do they pick a specific Host or just any available one?
> **Domain Expert:** They request an Event. We assign a Host from the rotating pool. The Client doesn't choose — we choose for them.
>
> **Dev:** And if two Events overlap in time, the system needs to ensure a Host isn't double-booked?
> **Domain Expert:** Right. One Host, one Event at a time.
>
> **Dev:** What does a Client pay for? Just the 2-hour hosting?
> **Domain Expert:** Yes — the Host runs the trivia with their laptop and answer sheets. Prizes are negotiated directly between the Client and Host, not handled by the platform.
