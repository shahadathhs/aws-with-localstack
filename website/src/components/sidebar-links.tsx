import Link from 'next/link';
import { navLinks } from '@/lib/nav';
import type { Lang } from '@/lib/i18n';

/** The top-bar links, repeated at the top of the mobile menu (hidden in the desktop sidebar, see global.css). */
export function SidebarLinks({ lang }: { lang: Lang }) {
  return (
    <nav className="flex flex-col">
      {navLinks(lang).map((l) => (
        <Link key={l.url} href={l.url} className="flex min-h-11 items-center border-b border-fd-border text-base text-fd-foreground">
          {l.text}
        </Link>
      ))}
    </nav>
  );
}
