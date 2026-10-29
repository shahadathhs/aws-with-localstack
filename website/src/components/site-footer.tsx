import Link from 'next/link';
import { Logo } from './logo';
import { source } from '@/lib/source';
import { footerCopy } from '@/lib/footer-copy';
import { flatPages, type FolderNode } from '@/lib/page-tree';
import { appName, author, gitConfig } from '@/lib/shared';
import type { Lang } from '@/lib/i18n';

type Column = { title: string; links: { name: React.ReactNode; href: string; external?: boolean }[] };

const START_FOLDERS = ['getting-started', 'basics'];
const YEAR = new Date().getFullYear(); // fixed when the site is built
const folderKey = (f: FolderNode) => flatPages(f.children)[0]?.url.split('/')[2] ?? '';

/**
 * Site-wide footer. The lesson columns come from the page tree, so a new lesson or service shows up here without
 * touching this file; the first two folders (setup guides) share one "Start here" column.
 */
export function SiteFooter({ lang }: { lang: Lang }) {
  const t = footerCopy[lang];
  const repo = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
  const folders = source.getPageTree(lang).children.filter((n): n is FolderNode => n.type === 'folder');
  const asLinks = (nodes: FolderNode[]) => nodes.flatMap((f) => flatPages(f.children)).map((p) => ({ name: p.name, href: p.url }));

  const columns: Column[] = [
    { title: t.start, links: [{ name: t.plan, href: `/${lang}/learning-plan` }, ...asLinks(folders.filter((f) => START_FOLDERS.includes(folderKey(f))))] },
    ...folders.filter((f) => !START_FOLDERS.includes(folderKey(f))).map((f) => ({ title: String(f.name), links: asLinks([f]) })),
    {
      title: t.project,
      links: [
        { name: t.github, href: repo, external: true },
        { name: t.issues, href: `${repo}/issues/new/choose`, external: true },
        { name: t.contributing, href: `${repo}/blob/main/CONTRIBUTING.md`, external: true },
        { name: t.conduct, href: `${repo}/blob/main/CODE_OF_CONDUCT.md`, external: true },
        { name: t.security, href: `${repo}/blob/main/SECURITY.md`, external: true },
        { name: t.license, href: `${repo}/blob/main/LICENSE`, external: true },
      ],
    },
    {
      title: t.author,
      links: [
        { name: t.about, href: `/${lang}/author` },
        { name: t.portfolio, href: author.site, external: true },
        { name: 'GitHub', href: author.github, external: true },
        { name: 'LinkedIn', href: author.linkedin, external: true },
        { name: 'X', href: author.x, external: true },
        { name: 'Medium', href: author.medium, external: true },
      ],
    },
  ];

  return (
    <footer className="site-foot">
      <div className="col">
        <div className="foot-top">
          <Link href={`/${lang}`} className="brand">
            <Logo />
            {appName}
          </Link>
          <p>{t.blurb}</p>
          <Link href={`/${lang}/learning-plan`} className="foot-cta">
            {t.cta} →
          </Link>
        </div>
        <div className="foot-cols">
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2>{c.title}</h2>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.name}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="foot-legal">
          <p>{t.rights(YEAR, author.name)}</p>
          <p>{t.built}</p>
          <p className="foot-fine">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
