# Admin editor setup

The visual Nuxt editor at `/admin/` replaces the former Decap editing interface. It reuses the existing GitHub OAuth app and repository permissions; no new account service is required. Saves commit the edited JSON content and uploaded images together, then Cloudflare Pages rebuilds the site.

## Who can edit?

The editor does **not** maintain its own user list. Access is controlled by **GitHub repo permissions**:

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

Production (`master`) uses `https://bingethinkers.com` for OAuth. The production deployment serves the Nuxt site and the OAuth routes in `dist/_worker.js`.

### 2. Cloudflare Pages environment variables

In Cloudflare → **Workers & Pages** → your project → **Settings** → **Variables and Secrets**:

When adding each variable, enable the correct **environment** checkbox:

- **Preview** — required for `dev.bingethinkers-com.pages.dev/admin/`
- **Production** — required for `bingethinkers.com/admin`

If you only set Production, preview `/admin` will show `GITHUB_CLIENT_ID is not configured` even though the variable appears in the dashboard.

**Preview:**

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |
| `GOOGLE_MAPS_API_KEY` | Browser key for event address suggestions |

**Production:**

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |
| `GOOGLE_MAPS_API_KEY` | Browser key for event address suggestions |

After adding or changing variables, **trigger a new deploy** — existing deployments do not pick up new values.

With the checked-in `wrangler.toml`, store `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as **encrypted secrets** in Cloudflare. The Wrangler configuration controls plain-text runtime variables, so a client ID added only as a dashboard plain-text variable can be dropped during deployment. Although the client ID is public, storing it as a secret keeps both OAuth settings attached to the deployed Worker. Check `/api/auth` after deployment; it should return the GitHub redirect page without a configuration error.

For `GOOGLE_MAPS_API_KEY`, enable **Maps JavaScript API** and **Places API (New)** in Google Cloud. Restrict the key to those APIs and to the website referrers that use the CMS:

- `https://bingethinkers.com/*`
- `https://*.bingethinkers-com.pages.dev/*`
- `http://localhost:*/*` for local CMS testing

The key is used in the browser, so the restrictions are important. Without it, editors can still enter an address manually, but Google suggestions will be unavailable.

The sign-in flow requests the `repo` scope only, checks a short-lived `state` cookie set by `/api/auth`, and hands the GitHub token only to the editor on the same origin as `/api/callback`. Sign in from `/admin/` on that origin: the popup must be opened by the editor (opening `/api/callback` directly, or signing in from another host such as localhost, will not complete).

OAuth is implemented by `server/api/auth.get.ts` and `server/api/callback.get.ts` in the generated Nuxt worker. The post-build verification rejects deployments that do not contain those routes and the contact form route.

### 3. Branches (production vs preview CMS)

Each Cloudflare preview build runs `scripts/prepare-admin.mjs`, which sets the CMS target branch from `CF_PAGES_BRANCH`:

| Cloudflare build | `CF_PAGES_BRANCH` | CMS commits go to |
|------------------|-------------------|-------------------|
| Production (`master`) | `master` | `master` → live site |
| Preview (`dev`, PRs, etc.) | `dev` (or branch name) | That preview branch only |

- **Production:** `https://bingethinkers.com/admin` — edits go to `master`.
- **Preview:** `https://dev.bingethinkers-com.pages.dev/admin/` — edits go to `dev`. Use this stable URL for CMS testing (not the hash preview URL).

### 4. Deploy

Push and let Cloudflare build. Open `/admin/` (with trailing slash) on the deployment you want and click **Sign in with GitHub**.

## Add a second editor

1. GitHub → repo **FranekKimono/bingethinkers.com** → **Settings** → **Collaborators** (or **Manage access**)
2. **Add people** → enter their GitHub username or email
3. Role: **Write** (enough to publish content from the editor; not Admin unless they need repo settings)
4. They accept the invite
5. They visit `/admin/` on production or preview, log in with **their** GitHub account, and edit Calendar, Locations, and Pages

No editor configuration change is required per user.

## What editors can change

| Area | Source | Editing behavior |
|------|--------|------------------|
| Calendar | `data/events.json` | Weekly and custom schedules, dates, times, per-Event customizations, cancellation, and restoration |
| Locations | `data/locations.json` | Shared names and addresses; archive and restore for later reuse |
| Pages | `data/pages.json` | Six fixed page layouts with click-to-edit content, images, buttons, FAQ/testimonial entries, and search settings |
| Images | `public/images/*` | PNG, JPEG, WebP, GIF, or AVIF uploads, up to 8 MB each |

The preview shows unsaved page changes immediately. **Save & publish** commits all pending edits and uploads in one operation. The site changes after the rebuild succeeds. There is no separate saved-draft workflow.

Location corrections update every linked Event, including past Events. When a venue moves, create a new Location and apply it to the relevant Events. Archiving a Location does not move or cancel scheduled Events.

## Troubleshooting

- **Editor does not open from a local HTML file:** `/admin/` is now a Nuxt page. Start `npm run dev` and visit the reported localhost URL with `/admin/`. Use `/admin/?demo=1` for a development-only preview that cannot publish.
- **Configuration could not load:** check `/admin/editor-config.json`. `scripts/prepare-admin.mjs` generates this file during `dev` and `build`.
- **"Sign-in could not be verified":** the popup's state cookie was missing or expired (more than 10 minutes, or cookies blocked for the site). Close the popup and sign in again from `/admin/`.
- **Sign-in popup fails or returns to the wrong site:** check the OAuth callback URLs, Preview/Production variables, and use the stable branch URL for preview editing. A change to Cloudflare variables requires a new deployment.
- **`GITHUB_CLIENT_ID is not configured`:** enable the variable in the correct Cloudflare environment and redeploy. Keep `./build.sh` as the build command so the full Worker and OAuth routes are verified.
- **Sign-in works, saving fails:** the GitHub user needs write permission on the configured repository branch. Branch protections still apply.
- **Someone saved newer changes:** download your unpublished changes before reloading, then reapply them to the latest content. The editor never forces an overwrite of a newer Git commit.
- **Saved changes are not visible yet:** the save completed, but Cloudflare may still be rebuilding. Check the branch's deployment result before expecting the public page to change.
- **Address suggestions are unavailable:** check the Google Maps key, API enablement, and allowed website referrers. Manual addresses remain supported.
- **Legacy Markdown or CMS config edits have no effect:** the six fixed pages and new editor use the JSON sources listed above. The old Markdown is a migration reference, not the live content source.
