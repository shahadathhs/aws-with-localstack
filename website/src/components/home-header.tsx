'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LanguageSelect, LanguageSelectText } from 'fumadocs-ui/layouts/shared/slots/language-select';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { SiteHeader } from './site-header';
import { navLinks } from '@/lib/nav';
import type { Lang } from '@/lib/i18n';

/** Header for pages outside the docs layout; on mobile the menu is a simple panel under the bar. */
export function HomeHeader({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SiteHeader
        lang={lang}
        menu={
          <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex size-11 items-center justify-center">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        }
      />
      {open && (
        <div className="fixed inset-x-0 top-14 z-20 border-b border-fd-border bg-fd-background px-4 pb-6 md:hidden">
          <nav className="flex flex-col">
            {navLinks(lang).map((l) => (
              <Link key={l.url} href={l.url} onClick={() => setOpen(false)} className="flex min-h-11 items-center border-b border-fd-border">
                {l.text}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LanguageSelect>
              <LanguageSelectText />
            </LanguageSelect>
            <ThemeSwitch mode="light-dark-system" />
          </div>
        </div>
      )}
    </>
  );
}
