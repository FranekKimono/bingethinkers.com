import pages from "~/data/pages.json";
import { safeImage } from "~/utils/page-content";

export type PageId = keyof typeof pages;

export const SITE_URL = "https://bingethinkers.com";
const DEFAULT_SOCIAL_IMAGE = "/splash.jpg";

/** Absolute URL for a site path or an already-absolute image. */
export function absoluteUrl(path: string): string {
  return path.startsWith("/") ? `${SITE_URL}${path}` : path;
}

export function usePageContent(id: PageId, options: { image?: string } = {}) {
  const preview = useState<{ id: PageId; content: any } | null>(
    "editor-page-preview",
    () => null,
  );
  const settings = computed<any>(() =>
    preview.value?.id === id ? preview.value.content : pages[id],
  );
  const route = useRoute();
  // Pages are served with a trailing slash; the canonical URL matches that.
  const canonical = computed(
    () => `${SITE_URL}${route.path.replace(/\/+$/, "")}/`,
  );
  const image = computed(() => {
    const value = safeImage(options.image && settings.value[options.image]);
    return absoluteUrl(
      value.startsWith("/") || value.startsWith("https://")
        ? value
        : DEFAULT_SOCIAL_IMAGE,
    );
  });
  useHead({ link: [{ rel: "canonical", href: canonical }] });
  useSeoMeta({
    title: () => settings.value.seoTitle,
    description: () => settings.value.seoDescription,
    ogTitle: () => settings.value.seoTitle,
    ogDescription: () => settings.value.seoDescription,
    ogUrl: canonical,
    ogType: "website",
    ogSiteName: "Binge Thinkers",
    ogLocale: "en_CA",
    ogImage: image,
    twitterCard: "summary_large_image",
    twitterTitle: () => settings.value.seoTitle,
    twitterDescription: () => settings.value.seoDescription,
    twitterImage: image,
  });
  return settings;
}
