import type { CSSProperties } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { DocsHeader } from '@/components/docs-header';
import { SidebarLinks } from '@/components/sidebar-links';
import { isLang, i18n } from '@/lib/i18n';

// The site top bar is fixed and 56px tall; the docs grid starts below it.
const below: CSSProperties = { ['--fd-banner-height' as string]: '56px', paddingTop: '56px' };

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const l = isLang(lang) ? lang : i18n.defaultLanguage;
  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={source.getPageTree(lang)}
      slots={{ header: DocsHeader }}
      containerProps={{ style: below }}
      sidebar={{ banner: <SidebarLinks lang={l} /> }}
    >
      {children}
    </DocsLayout>
  );
}
