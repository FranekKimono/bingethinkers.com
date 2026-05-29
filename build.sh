#!/bin/bash
# Cloudflare Pages build script — handles both production (master) and preview (dev) branches

if [ "$CF_PAGES_BRANCH" = "master" ]; then
  echo "→ Building production (coming-soon page)"
  mkdir -p dist
  cp index.html coming-soon.jpg dist/
  [ -f README.md ] && cp README.md dist/
else
  echo "→ Building preview (Nuxt site) on branch: $CF_PAGES_BRANCH"
  npm install
  npm run generate
fi

node scripts/write-oauth-worker.mjs
node scripts/patch-oauth-routes.mjs

# Repo-root Pages Functions shadow _worker.js and often miss env bindings on preview.
rm -rf functions

echo "  Done (dist + OAuth worker)."
