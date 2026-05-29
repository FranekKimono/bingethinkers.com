# Decap CMS setup

Decap CMS at `/admin` edits content in this repo via GitHub. There is no separate CMS server — saves commit to Git, and Cloudflare Pages rebuilds the site.

## Who can edit?

Decap does **not** maintain its own user list. Access is controlled by **GitHub repo permissions**:

- Anyone who can **log in with GitHub** and has **write access** to `FranekKimono/bingethinkers.com` can use `/admin`.
- To add a second editor, invite them as a **collaborator** on the repo (see below).
- To remove access, remove them from repo collaborators or downgrade their role.

Optional extra gate: [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) in front of `/admin` so only specific emails can even reach the login page. That is separate from GitHub permissions.

## One-time setup (repo owner)

### 1. GitHub OAuth App

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. **Application name:** Binge Thinkers CMS (or similar)
3. **Homepage URL:** `https://bingethinkers.com`
4. **Authorization callback URLs** (add both):
   - `https://bingethinkers.com/api/callback` — production
   - `https://dev.bingethinkers-com.pages.dev/api/callback` — preview CMS on `dev`
5. Create the app and note the **Client ID**
6. Generate a **Client Secret**

Preview builds use **same-origin OAuth** on `https://dev.bingethinkers-com.pages.dev` (stable branch URL). Open `/admin/` on that URL when testing CMS on `dev`, not the per-deploy hash URL.

Production (`master`) uses `https://bingethinkers.com` for OAuth. The master deploy is currently a coming-soon page, but it still serves OAuth at `/api/auth` and `/api/callback` via Cloudflare Pages Functions.

### 2. Cloudflare Pages environment variables

In Cloudflare → **Workers & Pages** → your project → **Settings** → **Environment variables**:

**Preview** (required for dev CMS at `dev.bingethinkers-com.pages.dev/admin/`):

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |

**Production** (required for `bingethinkers.com/admin` once master deploys the site):

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |

OAuth is implemented by `functions/api/auth.js` and `functions/api/callback.js` (copied into `dist/` at build time). Server routes in `server/api/` are for a future full `nuxt build` deploy.

### 3. Branches (production vs preview CMS)

Each Cloudflare preview build runs `scripts/prepare-admin.mjs`, which sets the CMS target branch from `CF_PAGES_BRANCH`:

| Cloudflare build | `CF_PAGES_BRANCH` | CMS commits go to |
|------------------|-------------------|-------------------|
| Production (`master`) | `master` | `master` → live site |
| Preview (`dev`, PRs, etc.) | `dev` (or branch name) | That preview branch only |

- **Production:** `https://bingethinkers.com/admin` — edits go to `master` (once master deploys the Nuxt site).
- **Preview:** `https://dev.bingethinkers-com.pages.dev/admin/` — edits go to `dev`. Use this stable URL for CMS testing (not the hash preview URL).

### 4. Deploy

Push and let Cloudflare build. Open `/admin/` (with trailing slash) on the deployment you want and click **Login with GitHub**.

## Add a second editor

1. GitHub → repo **FranekKimono/bingethinkers.com** → **Settings** → **Collaborators** (or **Manage access**)
2. **Add people** → enter their GitHub username or email
3. Role: **Write** (enough to commit content via Decap; not Admin unless they need repo settings)
4. They accept the invite
5. They visit `/admin/` on production or preview, log in with **their** GitHub account, and edit Pages, Settings, and Calendar Events

No Decap configuration change is required per user.

## What editors can change

| Collection | File(s) | Notes |
|------------|---------|--------|
| Pages | `content/*.md` | Site pages |
| Site Settings | `content/settings/home.md` | Home hero and features |
| Calendar Events | `data/events.json` | Trivia nights and recurrence rules |

After each save, Decap commits to the branch configured for that deployment; Cloudflare rebuilds that branch.

## Troubleshooting

- **Infinite reload at `/admin/`:** Was caused by a Nuxt redirect rule that replaced the admin page with `<meta refresh url=/admin/>`. Fixed — use `/admin/` and redeploy.
- **White screen at `/admin`:** Open DevTools → Console. Often a bad `config.yml`. Confirm `/admin/config.yml` loads (200, YAML content). Use `/admin/` with trailing slash.
- **Console spam `SES Removing unpermitted intrinsics`:** Usually a browser extension (often MetaMask). Try incognito with extensions disabled.
- **Login popup shows broken image / blank page:** `/api/auth` is serving the coming-soon page instead of redirecting to GitHub. Confirm `https://bingethinkers.com/api/auth` returns a **302 to github.com** (not HTML). Redeploy **master** after the OAuth routing fix. On preview, use `https://dev.bingethinkers-com.pages.dev/admin/` and confirm `/api/auth` redirects to GitHub.
- **Login popup loops:** Usually missing `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in Cloudflare Preview env vars, or wrong GitHub callback URL.
- **Login works but save fails:** User needs **Write** access on the repo; preview saves need permission to push to `dev`.
- **Events look wrong after edit:** Only fill recurrence fields that match the selected type (once / weekly / monthly / monthlyWeekday). Leave unused fields empty.
