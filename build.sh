#!/bin/bash
# Cloudflare Pages build script — handles both production (master) and preview (dev) branches

if [ "$CF_PAGES_BRANCH" = "master" ]; then
  echo "→ Building production (coming-soon page)"
  mkdir -p dist
  cp index.html coming-soon.jpg dist/
  [ -f README.md ] && cp README.md dist/
  cp -r functions dist/functions
  node scripts/patch-oauth-routes.mjs
  echo "  Done (coming-soon + OAuth functions)."
else
  echo "→ Building preview (Nuxt site) on branch: $CF_PAGES_BRANCH"
  npm install
  npm run generate
  # Cloudflare Pages Functions must live inside the build output directory
  cp -r functions dist/functions
  node scripts/patch-oauth-routes.mjs
  echo "  Done (dist + OAuth functions)."
fi
