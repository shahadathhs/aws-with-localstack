import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { siteUrl } from '@/lib/shared';

export default function sitemap(): MetadataRoute.Sitemap {
  const home = i18n.languages.map((lang) => ({ url: `${siteUrl}/${lang}`, changeFrequency: 'weekly' as const, priority: 1 }));
  const pages = i18n.languages.flatMap((lang) =>
    source.getPages(lang).map((p) => ({ url: `${siteUrl}${p.url}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  );
  return [...home, ...pages];
}
