import type { Lang } from './i18n';

/** The three top-bar links; services live in the lesson sidebar (docs/design/README.md, Navigation). */
const NAV: Record<Lang, { label: string; path: string }[]> = {
  en: [
    { label: 'Learning plan', path: 'learning-plan' },
    { label: 'Getting started', path: 'getting-started/localstack-compose' },
    { label: 'Basics', path: 'basics/aws-cli' },
  ],
  bn: [
    { label: 'শেখার পরিকল্পনা', path: 'learning-plan' },
    { label: 'শুরু করা', path: 'getting-started/localstack-compose' },
    { label: 'মূল ধারণা', path: 'basics/aws-cli' },
  ],
};

export function navLinks(lang: Lang) {
  return NAV[lang].map((l) => ({ text: l.label, url: `/${lang}/${l.path}`, active: 'nested-url' as const }));
}
