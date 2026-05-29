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
4. **Authorization callback URL:** `https://bingethinkers.com/api/callback`
5. Create the app and note the **Client ID**
6. Generate a **Client Secret**

### 2. Cloudflare Pages environment variables

In Cloudflare → **Workers & Pages** → your project → **Settings** → **Environment variables**, add for **Production and Preview**:

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |
| `CMS_OAUTH_BASE_URL` | `https://bingethinkers.com` (same on preview — see below) |

These are read at runtime by `server/api/auth.get.ts` and `server/api/callback.get.ts`. **Commit those route files** — they contain no secrets. Only the env var values stay out of git (see `.env.example`).

### 3. Branches (production vs preview CMS)

Each Cloudflare build runs `scripts/prepare-admin.mjs`, which sets the CMS target branch from `CF_PAGES_BRANCH`:

| Cloudflare build | `CF_PAGES_BRANCH` | CMS commits go to |
|------------------|-------------------|-------------------|
| Production (`master`) | `master` | `master` → live site |
| Preview (`dev`, PRs, etc.) | `dev` (or branch name) | That preview branch only |

- **Production:** `https://bingethinkers.com/admin` — edits go to `master`.
- **Preview:** `https://<preview-url>/admin` — edits go to `dev` (or the branch that was deployed).

OAuth always uses `CMS_OAUTH_BASE_URL` (production) so GitHub login works from preview URLs without registering every `*.pages.dev` callback.

### 4. Deploy

Push and let Cloudflare build. Open `/admin` on the deployment you want (production or preview) and click **Login with GitHub**.

## Add a second editor

1. GitHub → repo **FranekKimono/bingethinkers.com** → **Settings** → **Collaborators** (or **Manage access**)
2. **Add people** → enter their GitHub username or email
3. Role: **Write** (enough to commit content via Decap; not Admin unless they need repo settings)
4. They accept the invite
5. They visit `/admin` on production or preview, log in with **their** GitHub account, and edit Pages, Settings, and Calendar Events

No Decap configuration change is required per user.

## What editors can change

| Collection | File(s) | Notes |
|------------|---------|--------|
| Pages | `content/*.md` | Site pages |
| Site Settings | `content/settings/home.md` | Home hero and features |
| Calendar Events | `data/events.json` | Trivia nights and recurrence rules |

After each save, Decap commits to the branch configured for that deployment; Cloudflare rebuilds that branch.

## Troubleshooting

- **White screen at `/admin`:** Open DevTools → Console. Often a bad `config.yml` (fixed by removing unsupported `condition` fields). Confirm `/admin/config.yml` loads (200). Use `/admin/` with trailing slash.
- **Console spam `SES Removing unpermitted intrinsics`:** Usually a browser extension (often MetaMask). It is noisy but unrelated to the CMS. Try an incognito window with extensions disabled to test admin.
- **Login popup loops / keeps reopening:** Pin Decap to one version (see `index.html`), confirm GitHub OAuth callback is exactly `https://bingethinkers.com/api/callback`, and that `CMS_OAUTH_BASE_URL` is set on Preview builds. OAuth always runs on production; preview admin receives the token via `postMessage`.
- **Login button does nothing / OAuth error:** Check `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `CMS_OAUTH_BASE_URL` in Cloudflare. GitHub OAuth callback must be `https://bingethinkers.com/api/callback`.
- **Login works but save fails:** User needs **Write** access on the repo; preview saves need permission to push to `dev`.
- **Events look wrong after edit:** Only fill recurrence fields that match the selected type (once / weekly / monthly / monthlyWeekday). Leave unused fields empty.
