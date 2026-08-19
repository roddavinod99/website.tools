import type { SiteConfig, NavItem } from "@/types";

export const siteConfig: SiteConfig = {
  name: "DevStackIO",
  description:
    "The internet's best collection of free online developer tools from DevStackIO. JSON formatters, JWT decoders, image compressors, and more — all in your browser.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tools.devstackio.com",
  mainSiteUrl: "https://www.devstackio.com",
  mainSiteName: "DevStackIO",
  ogImage: "/tools-devstackio--preview-card.png",
  links: {
    github: "https://github.com/roddavinod99",
  },
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@devstackio.com",
  legal: {
    lastUpdated: {
      privacy: "2026-06-15",
      terms: "2026-06-15",
      cookie: "2026-06-15",
      disclaimer: "2026-06-15",
      security: "2026-07-20",
    },
  },
};

export const mainNav: NavItem[] = [
  { title: "Tools", href: "/tools" },
  { title: "Guides", href: "/guides" },
  { title: "Learning", href: "/learning" },
  { title: "Changelog", href: "/changelog" },
];