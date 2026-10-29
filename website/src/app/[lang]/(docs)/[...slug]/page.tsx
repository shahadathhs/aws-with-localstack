import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { JsonLd } from '@/components/json-ld';
import { personLd } from '@/lib/structured-data';
import { DocsSidebar } from '@/components/docs-sidebar';
import { LessonHeader } from '@/components/lesson/lesson-header';
import { lessonLabels } from '@/lib/lesson-labels';
import { isLang, i18n } from '@/lib/i18n';
import type { Node } from 'fumadocs-core/page-tree';

const flat = (nodes: Node[]): { url: string; name: React.ReactNode }[] =>
  nodes.flatMap((n) => (n.type === 'page' ? [n] : n.type === 'folder' ? [...(n.index ? [n.index] : []), ...flat(n.children)] : []));
const words = {
  en: { prev: 'Previous', next: 'Next', lessons: 'All lessons', lesson: 'Lesson', of: 'of' },
  bn: { prev: 'আগের পাতা', next: 'পরের পাতা', lessons: 'সব পাঠ', lesson: 'পাঠ', of: '/' },
};

type Props = { params: Promise<{ lang: string; slug: string[] }> };

export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const l = isLang(lang) ? lang : i18n.defaultLanguage;
  const t = words[l];
  const tree = source.getPageTree(lang).children;
  const pages = flat(tree);
  const at = pages.findIndex((p) => p.url === page.url);
  const prev = at > 0 ? pages[at - 1] : null;
  const next = at >= 0 && at < pages.length - 1 ? pages[at + 1] : null;
  const folder = tree.find((n): n is Extract<Node, { type: 'folder' }> => n.type === 'folder' && flat(n.children).some((p) => p.url === page.url));
  const inFolder = folder ? flat(folder.children) : [];
  const group = folder && inFolder.length > 1 ? { name: folder.name, at: inFolder.findIndex((p) => p.url === page.url), total: inFolder.length } : null;
  const MDX = page.data.body;
  return (
    <div className="grid gap-x-10 px-4 py-8 md:px-12 md:py-12 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:border-e lg:border-fd-border lg:pe-4 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
        <details className="mb-6 border-b border-fd-border pb-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium">{t.lessons}</summary>
          <div className="mt-3"><DocsSidebar nodes={tree} current={page.url} /></div>
        </details>
        <div className="hidden lg:block"><DocsSidebar nodes={tree} current={page.url} /></div>
      </aside>
      <article className="min-w-0">
        <LessonHeader
          eyebrow={
            group && (
              <p className="lesson-eyebrow">
                <b>{group.name}</b> / {t.lesson} {group.at + 1} {t.of} {group.total}
              </p>
            )
          }
          title={page.data.title}
          description={page.data.description}
          time={page.data.time}
          needs={page.data.needs}
          learn={page.data.learn}
          toc={page.data.toc}
          t={lessonLabels[l]}
        />
        <div className="prose lesson mt-8">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) }, l)} />
        </div>
        {slug.join('/') === 'author' && <JsonLd data={personLd} />}
        <nav className="mt-14 grid gap-3 border-t border-fd-border pt-6 sm:grid-cols-2">
          {prev ? (
            <Link href={prev.url} className="rounded-md border border-fd-border px-4 py-3 hover:bg-fd-card">
              <span className="sec-label !mb-1 block">{t.prev}</span>
              <span className="font-medium">{prev.name}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={next.url} className="rounded-md border border-fd-border px-4 py-3 text-end hover:bg-fd-card">
              <span className="sec-label !mb-1 block">{t.next}</span>
              <span className="font-medium">{next.name}</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
