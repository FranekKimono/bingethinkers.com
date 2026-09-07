import test from "node:test";
import assert from "node:assert/strict";
import { safeHtml, safeLink, safeImage } from "../utils/page-content.ts";

test("rich copy retains editor formatting and removes executable HTML", () => {
  const clean = safeHtml(
    '<p>Hello <strong>world</strong></p><script>alert(1)</script><img src=x onerror=alert(2)><a href="javascript:alert(3)" onclick="alert(4)">Link</a>',
  );
  assert.ok(clean.includes("<p>Hello <strong>world</strong></p>"));
  assert.ok(!/script|alert|onerror|onclick|<img/.test(clean));
});
test("button destinations accept website links and reject executable or ambiguous URLs", () => {
  for (const link of [
    "/contact",
    "#calendar",
    "https://example.com/a?q=1",
    "mailto:info@example.com",
    "tel:+12045555555",
  ])
    assert.equal(safeLink(link), link);
  for (const link of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//example.com",
    "/\\example.com",
    "https://example.com/\nabc",
  ])
    assert.equal(safeLink(link), "#");
});
test("uploaded image previews allow raster images without executable data URLs", () => {
  assert.equal(
    safeImage("data:image/png;base64,YWJjZA=="),
    "data:image/png;base64,YWJjZA==",
  );
  assert.equal(safeImage("data:image/svg+xml;base64,YWJjZA=="), "");
  assert.equal(safeImage("javascript:alert(1)"), "");
});
