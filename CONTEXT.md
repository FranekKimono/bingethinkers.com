# Binge Thinkers

A hosted trivia night service. Clients book a Host to run a trivia Event at their venue or rented space.

## Language

**Client**:
A person or group that books a trivia night. May own the venue or rent one.
_Avoid_: Customer, Booker, Venue

**Host**:
A representative of Binge Thinkers who runs the trivia night at the Client's location. Brings a laptop and answer sheets. Hosts rotate through a shared availability pool.
_Avoid_: Representative, MC, Quizmaster

**Event**:
A 2-hour trivia session booked by a Client with a Host at a specific date, time, and location. Fixed base price; tiered pricing (package, day-of-week, group size, location) planned but not yet defined.
_Avoid_: Night, Booking, Session, Gig

## Architecture

**Static site**: Nuxt 3 with `@nuxt/content` for Markdown-driven pages, Decap CMS for content editing via GitHub web UI. Deployed to Cloudflare Pages.

**Contact form**: Nuxt Nitro API route (`/api/contact`) deployed as a Cloudflare Worker. Currently logs to console; needs an email provider (Resend, Mailchannels) wired in before launch.

**Content model**: Pages (how-it-works, pricing, about, faq, gallery) stored as Markdown in `content/`. Decap CMS provides a WYSIWYG admin at `/admin`. Home page rendered via `pages/index.vue` with settings pulled from `content/settings/home.md`.

**Color scheme**: Dark theme derived from `coming-soon.jpg` — warm off-black `#06030a` (never pure `#000`), deep purple `#480a77`, hot pink accent `#e85298`. Buttons use a darker `--color-accent-button` for WCAG contrast; inline links use `--color-link`. All dark surfaces use purple-tinted off-blacks layered as `--color-bg` → `--color-surface` → `--color-border`. Tokens and focus rings live in `assets/css/main.css`.

## Example Dialogue

> **Dev:** When a Client books, do they pick a specific Host or just any available one?
> **Domain Expert:** They request an Event. We assign a Host from the rotating pool. The Client doesn't choose — we choose for them.
>
> **Dev:** And if two Events overlap in time, the system needs to ensure a Host isn't double-booked?
> **Domain Expert:** Right. One Host, one Event at a time.
>
> **Dev:** What does a Client pay for? Just the 2-hour hosting?
> **Domain Expert:** Yes — the Host runs the trivia with their laptop and answer sheets. Prizes are negotiated directly between the Client and Host, not handled by the platform.
