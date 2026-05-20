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
5. **Environment variables** (in Cloudflare Pages → Settings → Variables):
   - `RESEND_API_KEY` — if using Resend for contact form emails

### On every push

Cloudflare Pages auto-deploys from `main`. No manual steps.

## Content editing (for non-devs)

Go to **bingethinkers.com/admin** → log in with GitHub. Decap CMS provides a WYSIWYG editor for:

- **Pages** — edit any content page (About, Pricing, How It Works, FAQ, Gallery)
- **Settings** — update the home page hero text, feature cards, and CTA

All changes are committed directly to the `main` branch and auto-deployed.

> **First-time setup:** update `public/admin/config.yml` → replace `YOUR_GITHUB_USER` with your actual GitHub username.

## Contact form

The contact form posts to `/api/contact` (Nuxt Nitro handler deployed as a Cloudflare Worker). Currently logs submissions to the console. **Before launch**, wire up an email provider:

1. Sign up at [resend.com](https://resend.com) (free tier)
2. Add `RESEND_API_KEY` to Cloudflare Pages environment variables
3. Uncomment and configure the Resend code in `server/api/contact.post.ts`

## Redirect

`binge-thinkers.com` → `bingethinkers.com` (301). Set up via Cloudflare **Redirect Rules** on the binge-thinkers.com zone.

## Email

MX records for Private Email on `bingethinkers.com` are **DNS only** (gray cloud) in Cloudflare DNS. Do not proxy.
