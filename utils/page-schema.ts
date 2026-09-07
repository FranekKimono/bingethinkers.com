export interface EditorField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "rich" | "image" | "link" | "list";
  fields?: EditorField[];
  fixed?: boolean;
}
export interface EditorSection {
  id: string;
  label: string;
  fields: EditorField[];
}
const f = (
  key: string,
  label: string,
  type: EditorField["type"] = "text",
): EditorField => ({ key, label, type });
const image = (key: string, alt: string, label = "Image") => [
  f(key, label, "image"),
  f(alt, "Image description"),
];
const link = (key: string, url: string, label = "Button") => [
  f(key, `${label} label`),
  f(url, `${label} destination`, "link"),
];
export const pageChoices = [
  { id: "home", label: "Home", url: "/" },
  { id: "testimonials", label: "Testimonials", url: "/testimonials" },
  { id: "contact", label: "Book & Contact", url: "/contact" },
  { id: "our-story", label: "Our Story", url: "/our-story" },
  { id: "faq", label: "FAQ", url: "/faq" },
  { id: "privacy", label: "Privacy Policy", url: "/privacy" },
];
export const pageSettings: EditorSection = {
  id: "settings",
  label: "Page settings",
  fields: [
    f("seoTitle", "Search title"),
    f("seoDescription", "Search description", "textarea"),
  ],
};
export const pageSections: Record<string, EditorSection[]> = {
  home: [
    {
      id: "hero",
      label: "Welcome",
      fields: [
        f("heroTitle", "Heading", "rich"),
        f("heroSubtitle", "Introduction", "textarea"),
        ...image("heroImage", "heroAlt"),
        ...link("ctaText", "ctaUrl"),
      ],
    },
    {
      id: "intro",
      label: "About our trivia",
      fields: [
        f("introEyebrow", "Short introduction"),
        f("introTitle", "Heading"),
        f("introBody", "Copy", "textarea"),
        ...image("introImage", "introAlt"),
        ...link("storyLinkText", "storyLinkUrl", "Our Story link"),
        ...link("clientsLinkText", "clientsLinkUrl", "Testimonials link"),
      ],
    },
    {
      id: "calendar",
      label: "Calendar introduction",
      fields: [
        f("eventsTitle", "Heading"),
        f("eventsSubtitle", "Introduction", "textarea"),
      ],
    },
    {
      id: "bottom",
      label: "Booking invitation",
      fields: [
        f("bottomCtaTitle", "Heading"),
        f("bottomCtaBody", "Copy", "textarea"),
        ...link("bottomCtaText", "bottomCtaUrl"),
        ...link(
          "testimonialsLinkText",
          "testimonialsLinkUrl",
          "Testimonials link",
        ),
        ...link("faqLinkText", "faqLinkUrl", "FAQ link"),
      ],
    },
  ],
  testimonials: [
    {
      id: "intro",
      label: "Introduction",
      fields: [f("title", "Heading"), f("intro", "Copy", "textarea")],
    },
    {
      id: "splash",
      label: "Feature image",
      fields: image("splashImage", "splashAlt"),
    },
    {
      id: "clients",
      label: "Client logos",
      fields: [
        f("clientsTitle", "Heading"),
        {
          key: "clients",
          label: "Client logos",
          type: "list",
          fixed: true,
          fields: [f("name", "Client name"), f("src", "Logo", "image")],
        },
      ],
    },
    {
      id: "quotes",
      label: "Testimonials and photos",
      fields: [
        f("quotesTitle", "Heading"),
        {
          key: "testimonials",
          label: "Testimonials",
          type: "list",
          fields: [
            f("quote", "Quote", "textarea"),
            f("name", "Name"),
            f("role", "Role or organization"),
          ],
        },
        {
          key: "gallery",
          label: "Gallery photos",
          type: "list",
          fixed: true,
          fields: image("src", "alt"),
        },
      ],
    },
  ],
  contact: [
    {
      id: "intro",
      label: "Introduction",
      fields: [f("title", "Heading"), f("intro", "Copy", "textarea")],
    },
    {
      id: "pricing",
      label: "Pricing",
      fields: [
        f("pricingTitle", "Heading"),
        f("pricingBody", "First paragraph", "textarea"),
        f("pricingCta", "Second paragraph", "textarea"),
        ...image("image", "imageAlt"),
      ],
    },
    {
      id: "form",
      label: "Contact form wording",
      fields: [
        f("nameLabel", "Name label"),
        f("namePlaceholder", "Name hint"),
        f("emailLabel", "Email label"),
        f("emailPlaceholder", "Email hint"),
        f("phoneLabel", "Phone label"),
        f("phonePlaceholder", "Phone hint"),
        f("messageLabel", "Message label"),
        f("messagePlaceholder", "Message hint"),
        f("submitText", "Send button label"),
        f("sendingText", "Sending message"),
        f("successText", "Success message", "textarea"),
        f("errorText", "Error message", "textarea"),
      ],
    },
  ],
  "our-story": [
    {
      id: "banner",
      label: "Banner",
      fields: image("bannerImage", "bannerAlt"),
    },
    {
      id: "intro",
      label: "Our beginnings",
      fields: [
        f("title", "Heading"),
        f("intro", "Introduction", "rich"),
        ...image("photoImage", "photoAlt"),
        f("afterPhoto", "Copy below photo", "rich"),
      ],
    },
    ...[0, 1].map((i) => ({
      id: `section-${i}`,
      label: i ? "A new chapter" : "Building something real",
      fields: [
        f(`sections.${i}.heading`, "Heading"),
        f(`sections.${i}.body`, "Copy", "rich"),
      ],
    })),
  ],
  faq: [
    {
      id: "intro",
      label: "Introduction",
      fields: [f("title", "Heading"), f("intro", "Copy", "rich")],
    },
    {
      id: "questions",
      label: "Questions and answers",
      fields: [
        {
          key: "questions",
          label: "Questions",
          type: "list",
          fields: [f("question", "Question"), f("answer", "Answer", "rich")],
        },
      ],
    },
    {
      id: "outro",
      label: "Closing invitation",
      fields: [f("outro", "Copy", "rich")],
    },
  ],
  privacy: [
    {
      id: "intro",
      label: "Introduction",
      fields: [f("title", "Heading"), f("intro", "Copy", "rich")],
    },
    ...[0, 1, 2, 3, 4].map((i) => ({
      id: `section-${i}`,
      label: [
        "Information collected",
        "How information is used",
        "Data storage",
        "Your rights",
        "Contact",
      ][i],
      fields: [
        f(`sections.${i}.heading`, "Heading"),
        f(`sections.${i}.body`, "Copy", "rich"),
      ],
    })),
  ],
};
