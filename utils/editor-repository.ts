import type { EventRecord, Location } from "./schedule";
export interface EditorConfig {
  repo: string;
  branch: string;
  oauthBase: string;
  mapsKey?: string;
}
export interface EditorData {
  events: { version: number; events: EventRecord[] };
  locations: { locations: Location[] };
  pages: Record<string, any>;
}
export interface PendingImage {
  path: string;
  base64: string;
  preview: string;
}
export interface Snapshot {
  head: string;
  tree: string;
  data: EditorData;
  media: string[];
}
export class RepositoryError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
export class EditorRepository {
  private config: EditorConfig;
  private token: string;
  private request: typeof fetch;
  constructor(
    config: EditorConfig,
    token: string,
    request: typeof fetch = fetch,
  ) {
    this.config = config;
    this.token = token;
    this.request = request;
  }
  private async api(path: string, method = "GET", body?: any): Promise<any> {
    const response = await this.request(
      `https://api.github.com/repos/${this.config.repo}/${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const messages: Record<number, string> = {
        401: "Your sign-in expired. Sign in again; your edits are still here.",
        403: "GitHub could not allow this action. Check your editing access or try again later.",
        404: "The editor content was not found on this version of the site.",
        409: "The site changed since you opened it. Your edits are still here; reload the latest content before applying them again.",
        422: "The site changed or GitHub rejected the save. Your edits have been kept.",
      };
      throw new RepositoryError(
        messages[response.status] ||
          "Could not connect to GitHub. Your edits have been kept; please retry.",
        response.status,
      );
    }
    return response.json();
  }
  async load(): Promise<Snapshot> {
    const ref = await this.api(
      `git/ref/heads/${encodeURIComponent(this.config.branch)}`,
    );
    const head = ref.object.sha,
      commit = await this.api(`git/commits/${head}`);
    const read = async (name: string) => {
      const file = await this.api(`contents/data/${name}.json?ref=${head}`);
      const bytes = Uint8Array.from(
        atob(file.content.replace(/\s/g, "")),
        (c) => c.charCodeAt(0),
      );
      return JSON.parse(new TextDecoder().decode(bytes));
    };
    const [events, locations, pages, tree] = await Promise.all([
      read("events"),
      read("locations"),
      read("pages"),
      this.api(`git/trees/${commit.tree.sha}?recursive=1`),
    ]);
    if (
      events.version !== 2 ||
      !Array.isArray(events.events) ||
      !Array.isArray(locations.locations) ||
      !pages.home
    )
      throw new Error(
        "This version of the site needs the editor content migration before it can be edited.",
      );
    return {
      head,
      tree: commit.tree.sha,
      data: { events, locations, pages },
      media: tree.tree
        .filter(
          (entry: any) =>
            entry.type === "blob" &&
            /^public\/.*\.(png|jpe?g|webp|gif|avif)$/i.test(entry.path),
        )
        .map((entry: any) => entry.path.replace(/^public/, "")),
    };
  }
  async publish(
    snapshot: Snapshot,
    data: EditorData,
    images: PendingImage[],
  ): Promise<Snapshot> {
    const ref = await this.api(
      `git/ref/heads/${encodeURIComponent(this.config.branch)}`,
    );
    if (ref.object.sha !== snapshot.head)
      throw new RepositoryError(
        "Someone saved newer changes. Your edits are still here. Download your changes, then reload the latest content and reapply them.",
        409,
      );
    const tree: any[] = [];
    for (const name of ["events", "locations", "pages"] as const)
      if (JSON.stringify(data[name]) !== JSON.stringify(snapshot.data[name]))
        tree.push({
          path: `data/${name}.json`,
          mode: "100644",
          type: "blob",
          content: JSON.stringify(data[name], null, 2) + "\n",
        });
    for (const image of images) {
      if (
        !/^public\/images\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif|avif)$/i.test(
          image.path,
        )
      )
        throw new Error("An image has an invalid filename.");
      const blob = await this.api("git/blobs", "POST", {
        content: image.base64,
        encoding: "base64",
      });
      tree.push({
        path: image.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
    }
    if (!tree.length) return snapshot;
    const created = await this.api("git/trees", "POST", {
      base_tree: snapshot.tree,
      tree,
    });
    const commit = await this.api("git/commits", "POST", {
      message: "Update website content from the visual editor",
      tree: created.sha,
      parents: [snapshot.head],
    });
    // Never force a ref: a save made after our check causes a conflict, not data loss.
    try {
      await this.api(
        `git/refs/heads/${encodeURIComponent(this.config.branch)}`,
        "PATCH",
        { sha: commit.sha, force: false },
      );
    } catch (error) {
      // A dropped response may still have applied the update. Verify before reporting failure.
      const current = await this.api(
        `git/ref/heads/${encodeURIComponent(this.config.branch)}`,
      ).catch(() => null);
      if (current?.object.sha !== commit.sha) throw error;
    }
    return {
      head: commit.sha,
      tree: created.sha,
      data: JSON.parse(JSON.stringify(data)),
      media: [
        ...new Set([
          ...snapshot.media,
          ...images.map((i) => i.path.replace(/^public/, "")),
        ]),
      ],
    };
  }
}
