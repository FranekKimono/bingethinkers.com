#!/bin/bash
# Cloudflare Pages build — Nuxt site for production (master) and preview branches
set -euo pipefail

echo "→ Building Nuxt site on branch: ${CF_PAGES_BRANCH:-local}"
npm install
npm run generate

node scripts/write-oauth-worker.mjs
node scripts/patch-oauth-routes.mjs

# Repo-root Pages Functions shadow _worker.js and often miss env bindings on preview.
rm -rf functions

echo "  Done (dist + OAuth worker)."
