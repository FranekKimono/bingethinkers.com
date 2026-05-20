# Binge Thinkers — Static Site

Coming soon page for bingethinkers.com. Hosted on Cloudflare Pages.

## Deploy to Cloudflare Pages (with Git)

### One-time setup

1. Push this repo to GitHub (new repo: `bingethinkers-com`)
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select GitHub → pick the `bingethinkers-com` repo → **Begin setup**
4. Build settings (leave defaults — there's no build step):
   - **Build command:** (leave blank)
   - **Build output directory:** `/`
5. Click **Save and Deploy**
6. After deploy succeeds, go to the project → **Custom domains**
7. Add `bingethinkers.com` → Cloudflare auto-creates the DNS record
8. Add `www.bingethinkers.com` → same, Pages auto-redirects `www` → apex

### Ongoing: update the site

Change the image or `index.html`, commit, push to `main`. Cloudflare auto-deploys.

## Redirect `binge-thinkers.com` → `bingethinkers.com`

1. In Cloudflare Dashboard, select the **binge-thinkers.com** zone
2. Go to **Rules** → **Redirect Rules** → **Create Rule**
3. Rule name: `Redirect to primary`
4. When incoming requests match: **All incoming requests**
5. Then: **Dynamic** redirect → URL: `https://bingethinkers.com`
6. Status code: **301** (permanent)
7. **Deploy**

## Email

MX records for jellyfish.systems email are on Cloudflare DNS for bingethinkers.com. Ensure they show **DNS only** (gray cloud), not proxied (orange cloud). Do not touch them.
