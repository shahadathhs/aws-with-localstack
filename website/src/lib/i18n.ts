import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'bn'],
  // content/docs/<lang>/..., URLs stay /en/s3/... as on the Astro site
  parser: 'dir',
  hideLocale: 'never',
});

export type Lang = (typeof i18n.languages)[number];

export function isLang(value: string): value is Lang {
  return (i18n.languages as string[]).includes(value);
}
