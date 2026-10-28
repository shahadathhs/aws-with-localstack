'use client';

import { useParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useDocsLayout } from 'fumadocs-ui/layouts/docs';
import { SiteHeader } from './site-header';
import { isLang, i18n } from '@/lib/i18n';

/** Replaces Fumadocs' mobile-only header slot with the site top bar on every breakpoint. */
export function DocsHeader() {
  const { slots } = useDocsLayout();
  const { lang } = useParams<{ lang: string }>();
  const Trigger = slots.sidebar.trigger;
  return (
    <SiteHeader
      wide
      lang={isLang(lang) ? lang : i18n.defaultLanguage}
      menu={
        <Trigger aria-label="Menu" className="inline-flex size-11 items-center justify-center">
          <Menu className="size-5" />
        </Trigger>
      }
    />
  );
}
