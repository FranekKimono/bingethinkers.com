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
4. **Authorization callback URL:** `https://bingethinkers.com` (homepage is fine; callback is a subpath)
5. Create the app and note the **Client ID**
6. Generate a **Client Secret**

### 2. Cloudflare Pages environment variables

In Cloudflare → **Workers & Pages** → your project → **Settings** → **Environment variables**, add (Production and Preview):

| Variable | Value |
|----------|--------|
| `GITHUB_CLIENT_ID` | Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from step 1 |

These are read at runtime by `server/api/auth.get.ts` and `server/api/callback.get.ts`. **Commit those route files** — they contain no secrets. Only the env var values stay out of git (see `.env.example`).

### 3. Production branch (CMS commits)

`public/admin/config.yml` sets `branch: master`. Every save from `/admin` commits to **`master`**, which is the production branch (`origin/HEAD` → `master`).

| Branch | Role |
|--------|------|
| `master` | Production site (`bingethinkers.com`) and **all CMS commits** |
| `dev` | Preview deployments only — code/content experiments, not the live CMS target |

Editors should use **`https://bingethinkers.com/admin`** on production. Preview builds on `dev` still ship the same `config.yml`, so `/admin` on a preview URL would also target `master`; avoid editing from preview URLs to prevent confusion.

If production ever moves to another branch, update `branch` in `config.yml` to match.

### 4. Deploy

Push and let Cloudflare build. Then open `https://bingethinkers.com/admin` and click **Login with GitHub**.

## Add a second editor

1. GitHub → repo **FranekKimono/bingethinkers.com** → **Settings** → **Collaborators** (or **Manage access**)
2. **Add people** → enter their GitHub username or email
3. Role: **Write** (enough to commit content via Decap; not Admin unless they need repo settings)
4. They accept the invite
5. They visit `https://bingethinkers.com/admin`, log in with **their** GitHub account, and edit Pages, Settings, and Calendar Events

No Decap configuration change is required per user.

## What editors can change

| Collection | File(s) | Notes |
|------------|---------|--------|
| Pages | `content/*.md` | Site pages |
| Site Settings | `content/settings/home.md` | Home hero and features |
| Calendar Events | `data/events.json` | Trivia nights and recurrence rules |

After each save, Decap opens a PR or commits directly (depending on config); Cloudflare rebuilds on push to the configured branch.

## Troubleshooting

- **Login button does nothing / OAuth error:** Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Cloudflare, and that OAuth app homepage URL matches the live site.
- **Login works but save fails:** User needs **Write** access on the repo; check `branch` in `config.yml` matches a branch they can push to.
- **Events look wrong after edit:** Recurrence fields are conditional — only fill fields that match the selected recurrence type (once / weekly / monthly / monthlyWeekday).
