import type { MetadataRoute } from "next";
import { DOCS } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://docs.powerchain.ventures";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...DOCS.map((doc) => ({
      url: `${base}/${doc.slug}`,
      changeFrequency: "weekly" as const,
      priority: doc.featured ? 0.9 : 0.7,
    })),
  ];
}
