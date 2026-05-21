# Binge Thinkers

Website for bingethinkers.com — hosted trivia night booking. Hosted on Cloudflare Pages.

---

## Branch structure

| Branch | Purpose | Deploys to |
|--------|---------|-----------|
| `master` | Production — coming-soon page | `bingethinkers.com` |
| `dev` | Development — full Nuxt site for review | `*.pages.dev` preview URL |

---

## Cloudflare Pages setup (one-time)

### 1. Connect repo to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select GitHub → choose the `bingethinkers.com` repo → **Begin setup**
3. Build settings:
   - **Production branch:** `master`
   - **Build command:** `npm run generate`
   - **Build output directory:** `dist/`
4. Click **Save and Deploy**

### 2. Enable branch previews

1. Project → **Settings** → **Builds & deployments**
2. Under **Preview deployments**, enable **All non-production branches**
3. Now every push to `dev` creates a private preview URL

### 3. Add custom domain

1. Project → **Custom domains** → Add `bingethinkers.com`
2. Add `www.bingethinkers.com` — Cloudflare auto-redirects `www` → apex

### 4. Add environment variables

Project → **Settings** → **Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | `re_xxx...` | From [resend.com](https://resend.com) API Keys |

### 5. Node.js compatibility (for contact form)

The `wrangler.toml` file in the repo enables `nodejs_compat`. No extra steps needed.

---

## Redirect `binge-thinkers.com` → `bingethinkers.com`

1. Cloudflare Dashboard → select `binge-thinkers.com` zone
2. **Rules** → **Redirect Rules** → **Create Rule**
3. Name: `Redirect to primary`
4. When: **All incoming requests**
5. Then: **Dynamic** redirect → `https://bingethinkers.com`
6. Status code: **301**
7. **Deploy**

---

## Domain & email

- **Registrar:** Namecheap
- **DNS:** Cloudflare (nameservers pointed to Cloudflare)
- **Email:** Namecheap Private Email (`info@bingethinkers.com` + 2 others)
- **MX records:** `mail.privateemail.com` — DNS only (gray cloud), NOT proxied

---

## How to update the site

### Coming-soon page (master)

Edit `index.html` or swap `coming-soon.jpg`. Commit to `master`. Auto-deploys.

### Full site (dev)

1. Make changes on the `dev` branch
2. Preview at `https://*.bingethinkers-com.pages.dev` (auto-deploys on push)
3. When approved, merge `dev` → `master`
4. Full Nuxt site goes live at `bingethinkers.com`

---

## Tech stack (dev branch)

- [Nuxt 3](https://nuxt.com) — Vue framework
- [Nuxt Content](https://content.nuxt.com) — Markdown-based pages
- [Decap CMS](https://decapcms.org) — WYSIWYG admin at `/admin`
- [Resend](https://resend.com) — Contact form email delivery
- Cloudflare Pages + Workers — Hosting + serverless API routes

### Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # Build static site to dist/
```

### Contact form

Form submissions go to `POST /api/contact` → Resend → `info@bingethinkers.com`.
Requires `RESEND_API_KEY` environment variable in Cloudflare Pages.

### Decap CMS

Available at `/admin` after deploy. Log in with GitHub. Requires updating `public/admin/config.yml` with the correct `YOUR_GITHUB_USER/repo` before use.
