/**
 * Writes the visual editor's public repository and OAuth configuration before build.
 * Cloudflare Pages sets CF_PAGES_BRANCH (e.g. master = production, dev = preview).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const adminDir = join("public", "admin");
mkdirSync(adminDir, { recursive: true });
const branch = process.env.CF_PAGES_BRANCH || "master";

/** Stable branch URL, e.g. dev.bingethinkers-com.pages.dev from any deploy hash. */
function previewBranchUrl() {
  const pagesUrl = process.env.CF_PAGES_URL;
  if (!pagesUrl) return null;

  try {
    const url = new URL(pagesUrl);
    const hostParts = url.hostname.split(".");
    if (hostParts.length >= 3 && hostParts[hostParts.length - 2] === "pages") {
      hostParts[0] = branch;
      return `${url.protocol}//${hostParts.join(".")}`;
    }
  } catch {
    /* fall through */
  }

  return null;
}

function oauthBaseUrl() {
  if (branch === "master") {
    return (
      process.env.CMS_OAUTH_BASE_URL || "https://bingethinkers.com"
    ).replace(/\/$/, "");
  }

  // Preview: same-origin OAuth on the stable branch URL (not production coming-soon).
  return (
    previewBranchUrl() ||
    (process.env.CF_PAGES_URL || "").replace(/\/$/, "") ||
    (process.env.CMS_OAUTH_BASE_URL || "https://bingethinkers.com").replace(
      /\/$/,
      "",
    )
  );
}

const oauthBase = oauthBaseUrl();

writeFileSync(
  join(adminDir, "editor-config.json"),
  JSON.stringify(
    {
      repo: "FranekKimono/bingethinkers.com",
      branch,
      oauthBase,
      mapsKey: process.env.GOOGLE_MAPS_API_KEY || "",
    },
    null,
    2,
  ) + "\n",
);
console.log(`[prepare-admin] Editor branch=${branch}, OAuth=${oauthBase}`);
