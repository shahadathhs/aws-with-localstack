'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { FullSearchTrigger, SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { LanguageSelect, LanguageSelectText } from 'fumadocs-ui/layouts/shared/slots/language-select';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { Logo } from './logo';
import { appName } from '@/lib/shared';
import { navLinks } from '@/lib/nav';
import type { Lang } from '@/lib/i18n';
import { cn } from '@/lib/cn';

/** Top bar for every page: brand, three links, search, language, theme. `menu` is the mobile menu button. */
export function SiteHeader({ lang, menu }: { lang: Lang; menu: ReactNode }) {
  const pathname = usePathname();
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-fd-border bg-fd-background/90 backdrop-blur-sm">
      <div className={cn('mx-auto flex h-full items-center gap-3 px-4 md:gap-5', 'max-w-[1080px] md:px-12')}>
        <Link href={`/${lang}`} className="brand shrink-0 whitespace-nowrap">
          <Logo />
          {appName}
        </Link>
        <nav className="ms-1 hidden items-center gap-5 text-sm md:flex">
          {navLinks(lang).map((l) => (
            <Link
              key={l.url}
              href={l.url}
              className={cn('whitespace-nowrap text-fd-muted-foreground hover:text-fd-foreground', pathname.startsWith(l.url) && 'font-semibold text-fd-foreground')}
            >
              {l.text}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <FullSearchTrigger hideIfDisabled className="hidden w-48 md:inline-flex" />
        <SearchTrigger hideIfDisabled className="p-2 md:hidden" />
        <LanguageSelect className="hidden md:inline-flex">
          <LanguageSelectText />
        </LanguageSelect>
        <ThemeSwitch className="hidden md:inline-flex" mode="light-dark-system" />
        <div className="md:hidden">{menu}</div>
      </div>
    </header>
  );
}
