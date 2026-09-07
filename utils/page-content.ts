import xss from "xss";
export function safeHtml(value: unknown): string {
  return xss(String(value || ""), {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      b: [],
      em: [],
      i: [],
      u: [],
      ul: [],
      ol: [],
      li: [],
      a: ["href", "title"],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style", "iframe", "object"],
  });
}
export function safeLink(value: unknown): string {
  const s = String(value || "").trim();
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(s) &&
    !/[\u0000-\u0020\\]/.test(s)
    ? s
    : "#";
}
export function safeImage(value: unknown): string {
  const s = String(value || "").trim();
  if (/^data:image\/(png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(s))
    return s;
  return /^(\/(?!\/)|https:\/\/|blob:)/i.test(s) && !/[\u0000-\u0020\\]/.test(s)
    ? s
    : "";
}
export function getField(object: any, path: string): any {
  return path.split(".").reduce((v, k) => v?.[k], object);
}
export function setField(object: any, path: string, value: any): void {
  const keys = path.split("."),
    last = keys.pop()!;
  let target = object;
  for (const k of keys) target = target[k];
  target[last] = value;
}
