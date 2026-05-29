# Binge Thinkers

Static site for bingethinkers.com, built with [Nuxt 3](https://nuxt.com) + [Nuxt Content](https://content.nuxt.com) + [Decap CMS](https://decapcms.org).

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
   - **Build command:** `npm run generate`
   - **Build output directory:** `dist/`
4. Add custom domain: `bingethinkers.com`
5. Set **environment variables** in Cloudflare Pages → Settings → Variables (see [Secrets](#secrets))

### On every push

Cloudflare Pages auto-deploys **production** from `master`. Pushes to `dev` (and other branches) get **preview** deployments only.

## Content editing (for non-devs)

Go to **bingethinkers.com/admin** → log in with GitHub. Decap CMS provides a WYSIWYG editor for:

- **Pages** — edit any content page (About, FAQ, Gallery, etc.)
- **Settings** — update the home page hero text, feature cards, and CTA
- **Calendar Events** — add or edit trivia nights in `data/events.json`

CMS commits go to the branch being built: **`master`** on production, **`dev`** on preview (see `scripts/prepare-admin.mjs`). Use **bingethinkers.com/admin** for live edits; use your **preview URL/admin** to test CMS changes on `dev` before merging.

**Setup and adding editors:** see [docs/decap-cms-setup.md](docs/decap-cms-setup.md) (GitHub OAuth, Cloudflare env vars, inviting a second GitHub user as a repo collaborator).

## Secrets

**Do not commit secret values.** `.env`, `.env.local`, and `.dev.vars` are gitignored. Copy [`.env.example`](.env.example) to `.env` for local dev.

**Do commit the server route files** (`server/api/auth.get.ts`, `server/api/callback.get.ts`, etc.). They contain no secrets — they read env vars at runtime. Without them in git, Cloudflare Pages cannot serve `/api/auth` or `/api/callback` and Decap login breaks.

Set these in **Cloudflare Pages → Settings → Environment variables** for production (and in `.env` locally):

| Variable | Used by | Required |
|----------|---------|----------|
| `GITHUB_CLIENT_ID` | Decap CMS OAuth | Yes, for `/admin` |
| `GITHUB_CLIENT_SECRET` | Decap CMS OAuth | Yes, for `/admin` |
| `CMS_OAUTH_BASE_URL` | OAuth callback host (use `https://bingethinkers.com` on preview too) | Recommended |
| `RESEND_API_KEY` | Contact form email | Before launch |
| `INSTAGRAM_TOKEN` | Instagram feed API | If using feed |
| `INSTAGRAM_ACCOUNT_ID` | Instagram feed API | If using feed |

GitHub OAuth app setup and collaborator access: [docs/decap-cms-setup.md](docs/decap-cms-setup.md).

## Contact form

The contact form posts to `/api/contact` (Nuxt Nitro handler deployed as a Cloudflare Worker). Currently logs submissions to the console. **Before launch**, wire up an email provider:

1. Sign up at [resend.com](https://resend.com) (free tier)
2. Add `RESEND_API_KEY` to Cloudflare Pages environment variables
3. Uncomment and configure the Resend code in `server/api/contact.post.ts`

## Redirect

`binge-thinkers.com` → `bingethinkers.com` (301). Set up via Cloudflare **Redirect Rules** on the binge-thinkers.com zone.

## Email

MX records for Private Email on `bingethinkers.com` are **DNS only** (gray cloud) in Cloudflare DNS. Do not proxy.
