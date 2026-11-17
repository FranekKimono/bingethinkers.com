# Binge Thinkers

Site for bingethinkers.com, built with [Nuxt 4](https://nuxt.com), a visual admin editor, and GitHub-backed content publishing.

Project documentation: [domain glossary](CONTEXT.md), [project background](docs/project-background.md), and [admin editor redesign](docs/admin-editor-design.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy to Cloudflare Pages

### One-time setup

1. Push this repo to GitHub
2. Cloudflare Dashboard → **Workers & Pages** → **Pages** → **Connect to Git**
3. Select repo. Configure build:
   - **Production branch:** `master`
   - **Build command:** `./build.sh`
   - **Build output directory:** `dist/`
4. Add custom domain: `bingethinkers.com`
5. Set **environment variables** in Cloudflare Pages → Settings → Variables (see [Secrets](#secrets))

### On every push

Cloudflare Pages auto-deploys **production** from `master`. Pushes to `dev` (and other branches) get **preview** deployments only.

| Branch | Purpose | Deploys to |
|--------|---------|-----------|
| `master` | Production — full Nuxt site | `bingethinkers.com` |
| `dev` | Preview / staging | `*.pages.dev` preview URL |

## Content editing (for non-devs)

Go to **bingethinkers.com/admin/** and sign in with GitHub.

- **Calendar** — click a date to add an Event or click an Event to change it. Repeats, individual customizations, cancellations, and restoration share the same calendar.
- **Locations** — save names and addresses for reuse; archive and restore places without removing existing Events.
- **Pages** — view the actual page and click a section to edit text, images, buttons, FAQs, or testimonials in the adjacent panel. Page layouts stay fixed; the shared header and footer are not editable. Search titles and descriptions are under Page settings.

**Save & publish** saves all pending content changes and uploaded images in one Git commit. Cloudflare then rebuilds the site. The editor reports a successful save separately from deployment completion. If another editor saves first, it keeps your edits and offers a download before you reload the latest content.

Production saves go to **`master`**; preview saves go to the branch configured by `CF_PAGES_BRANCH`. Use the stable [dev admin](https://dev.bingethinkers-com.pages.dev/admin/) for preview editing.

The source files are `data/events.json`, `data/locations.json`, and `data/pages.json`. The original Markdown files in `content/` are retained as migration references; the six fixed pages no longer read their copy from those files. Do not edit the legacy Markdown to change live page content.

The editor is a Nuxt route, so run the site and visit `/admin/`; opening an HTML file directly does not run the editor. For a local preview without GitHub sign-in, start `npm run dev` and open `/admin/?demo=1`. This mode is available only in development and cannot publish.

Sign-in only completes when the editor is open on the same origin as the OAuth callback (`bingethinkers.com` in production, the stable branch URL for previews), because the GitHub token is never handed to any other origin. For local work use the demo mode above.

**Setup and adding editors:** see [docs/decap-cms-setup.md](docs/decap-cms-setup.md). The existing OAuth configuration and GitHub collaborator permissions are reused.

## Verification

Use the Node version in `.node-version` (22.22.3 or newer; Cloudflare Pages reads the same file). Run `npm test` for recurrence, customization, cancellation, and atomic publishing checks. Run `npm run typecheck` to check the Vue and TypeScript code. Run `npm run build` to compile the public pages and admin, generate static previews, and verify the contact and OAuth Worker routes.

## Secrets

**Do not commit secret values.** `.env`, `.env.local`, and `.dev.vars` are gitignored. Copy [`.env.example`](.env.example) to `.env` for local dev.

**Do commit the server route files** (`server/api/auth.get.ts`, `server/api/callback.get.ts`, etc.). They contain no secrets — they read env vars at runtime. Without them in git, Cloudflare Pages cannot serve `/api/auth` or `/api/callback` and admin sign-in breaks.

Set these in **Cloudflare Pages → Settings → Variables and Secrets**. When adding each one, check **Preview** and/or **Production** as needed — preview CMS on `dev` only sees variables enabled for **Preview**. After changing variables, redeploy.

| Variable | Used by | Required |
|----------|---------|----------|
| `GITHUB_CLIENT_ID` | Admin GitHub OAuth | Yes, for `/admin` |
| `GITHUB_CLIENT_SECRET` | Admin GitHub OAuth | Yes, for `/admin` |
| `GOOGLE_MAPS_API_KEY` | CMS event address suggestions | Recommended for `/admin` |
| `RESEND_API_KEY` | Contact form email | Yes, for booking form |
| `INSTAGRAM_TOKEN` | Instagram feed API | If using feed |
| `INSTAGRAM_ACCOUNT_ID` | Instagram feed API | If using feed |

GitHub OAuth app setup and collaborator access: [docs/decap-cms-setup.md](docs/decap-cms-setup.md).

## Contact form

The contact form posts to `/api/contact` (Nuxt Nitro handler deployed as part of the Cloudflare Worker). Submissions are emailed via Resend when `RESEND_API_KEY` is set. Production uses `nuxt build`, and the post-build verification fails the deployment if the contact or OAuth routes are missing from the Worker.

## Redirect

`binge-thinkers.com` → `bingethinkers.com` (301). Set up via Cloudflare **Redirect Rules** on the binge-thinkers.com zone.

## Email

MX records for Private Email on `bingethinkers.com` are **DNS only** (gray cloud) in Cloudflare DNS. Do not proxy.
