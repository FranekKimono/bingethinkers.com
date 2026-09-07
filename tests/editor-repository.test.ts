import test from "node:test";
import assert from "node:assert/strict";
import {
  EditorRepository,
  type Snapshot,
  type EditorData,
} from "../utils/editor-repository.ts";
const config = {
  repo: "owner/site",
  branch: "preview/test",
  oauthBase: "https://example.test",
};
const data: EditorData = {
  events: { version: 2, events: [] },
  locations: { locations: [] },
  pages: { home: { title: "Original" } },
};
const snapshot: Snapshot = { head: "old", tree: "old-tree", data, media: [] };
const edited: EditorData = { ...data, pages: { home: { title: "New" } } };
const response = (value: any, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
test("publish saves all changed content and images in one commit using the base tree", async () => {
  const calls: { url: string; body: any }[] = [];
  const request = async (url: any, options: any) => {
    const body = options?.body ? JSON.parse(options.body) : undefined;
    calls.push({ url: String(url), body });
    if (String(url).includes("git/ref/"))
      return response({ object: { sha: "old" } });
    if (String(url).endsWith("git/blobs"))
      return response({ sha: "image-blob" });
    if (String(url).endsWith("git/trees")) return response({ sha: "new-tree" });
    if (String(url).endsWith("git/commits")) return response({ sha: "new" });
    return response({ object: { sha: "new" } });
  };
  const repo = new EditorRepository(
    config,
    "test-token",
    request as typeof fetch,
  );
  const saved = await repo.publish(snapshot, edited, [
    { path: "public/images/test.png", base64: "AA==", preview: "blob:test" },
  ]);
  assert.equal(saved.head, "new");
  const tree = calls.find((c) => c.url.endsWith("git/trees"))!.body;
  assert.equal(tree.base_tree, "old-tree");
  assert.deepEqual(
    tree.tree.map((e: any) => e.path),
    ["data/pages.json", "public/images/test.png"],
  );
  assert.deepEqual(
    calls.find((c) => c.url.endsWith("git/commits"))!.body.parents,
    ["old"],
  );
  assert.equal(calls.at(-1)!.body.force, false);
  assert.equal(snapshot.data.pages.home.title, "Original");
});
test("newer content stops the save before any writes", async () => {
  const methods: string[] = [];
  const request = async (_: any, options: any) => {
    methods.push(options.method);
    return response({ object: { sha: "someone-else" } });
  };
  await assert.rejects(
    () =>
      new EditorRepository(
        config,
        "test-token",
        request as typeof fetch,
      ).publish(snapshot, edited, []),
    /Someone saved newer changes/,
  );
  assert.deepEqual(methods, ["GET"]);
});
test("a race after creating a commit uses a non-forced ref update and keeps the original snapshot", async () => {
  const request = async (url: any, options: any) => {
    if (String(url).includes("git/ref/"))
      return response({ object: { sha: "old" } });
    if (String(url).endsWith("git/trees")) return response({ sha: "new-tree" });
    if (String(url).endsWith("git/commits")) return response({ sha: "new" });
    assert.equal(JSON.parse(options.body).force, false);
    return response({}, 422);
  };
  await assert.rejects(() =>
    new EditorRepository(config, "test-token", request as typeof fetch).publish(
      snapshot,
      edited,
      [],
    ),
  );
  assert.equal(snapshot.head, "old");
});
test("an uncertain ref response is verified so a completed save can be reported correctly", async () => {
  let refs = 0;
  const request = async (url: any) => {
    if (String(url).includes("git/ref/"))
      return response({ object: { sha: ++refs === 1 ? "old" : "new" } });
    if (String(url).endsWith("git/trees")) return response({ sha: "new-tree" });
    if (String(url).endsWith("git/commits")) return response({ sha: "new" });
    throw new TypeError("Network response lost");
  };
  const saved = await new EditorRepository(
    config,
    "test-token",
    request as typeof fetch,
  ).publish(snapshot, edited, []);
  assert.equal(saved.head, "new");
});
