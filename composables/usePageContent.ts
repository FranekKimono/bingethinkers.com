import pages from "~/data/pages.json";
export type PageId = keyof typeof pages;
export function usePageContent(id: PageId) {
  const preview = useState<{ id: PageId; content: any } | null>(
    "editor-page-preview",
    () => null,
  );
  const settings = computed<any>(() =>
    preview.value?.id === id ? preview.value.content : pages[id],
  );
  useSeoMeta({
    title: () => settings.value.seoTitle,
    description: () => settings.value.seoDescription,
    ogTitle: () => settings.value.seoTitle,
    ogDescription: () => settings.value.seoDescription,
  });
  return settings;
}
