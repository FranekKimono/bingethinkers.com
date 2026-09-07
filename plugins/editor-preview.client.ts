import { pageChoices, pageSections } from "~/utils/page-schema";
export default defineNuxtPlugin(() => {
  if (
    window.parent === window ||
    new URLSearchParams(location.search).get("editor-preview") !== "1"
  )
    return;
  const page = pageChoices.find(
    (p) =>
      p.url === location.pathname.replace(/\/$/, "") ||
      (p.url === "/" && location.pathname === "/"),
  );
  if (!page) return;
  const draft = useState<any>("editor-page-preview", () => null);
  const send = (data: any) => window.parent.postMessage(data, location.origin);
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== window.parent)
      return;
    if (event.data?.type === "editor:content" && event.data.pageId === page.id)
      draft.value = { id: page.id, content: event.data.content };
    if (event.data?.type === "editor:highlight") {
      for (const el of document.querySelectorAll("[data-edit-section]"))
        el.classList.toggle(
          "editor-selected",
          el.getAttribute("data-edit-section") === event.data.section,
        );
    }
  });
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement;
      const section = target.closest<HTMLElement>("[data-edit-section]");
      if (section) {
        event.preventDefault();
        event.stopImmediatePropagation();
        send({
          type: "editor:select",
          pageId: page.id,
          section: section.dataset.editSection,
        });
      } else if (target.closest("a,button,form")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        (event.target as HTMLElement).matches("[data-edit-section]")
      ) {
        event.preventDefault();
        send({
          type: "editor:select",
          pageId: page.id,
          section: (event.target as HTMLElement).dataset.editSection,
        });
      }
    },
    true,
  );
  const style = document.createElement("style");
  style.textContent =
    "[data-edit-section]{cursor:pointer;outline-offset:-3px;position:relative}[data-edit-section]:hover,[data-edit-section]:focus-visible{outline:2px dashed #e85298}.editor-selected{outline:3px solid #e85298!important}html{scroll-behavior:auto!important}";
  document.head.appendChild(style);
  const decorate = () => {
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-edit-section]",
    )) {
      el.tabIndex = 0;
      el.setAttribute(
        "aria-label",
        `Edit ${pageSections[page.id]?.find((s) => s.id === el.dataset.editSection)?.label || "section"}`,
      );
    }
  };
  onNuxtReady(() => {
    decorate();
    send({ type: "editor:ready", pageId: page.id });
  });
});
