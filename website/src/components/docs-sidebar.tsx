import Link from 'next/link';
import type { Node } from 'fumadocs-core/page-tree';
import { cn } from '@/lib/cn';

/** Lesson navigation: one labelled group per service, links below it. Plain in-flow list, no panel. */
export function DocsSidebar({ nodes, current }: { nodes: Node[]; current: string }) {
  const link = (url: string, name: React.ReactNode) => (
    <Link
      href={url}
      aria-current={url === current ? 'page' : undefined}
      className={cn(
        'flex gap-2.5 rounded-sm px-2.5 py-1.5 text-sm leading-snug',
        url === current ? 'bg-fd-accent font-medium text-fd-accent-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
      )}
    >
      <i className="side-dot" />
      <span>{name}</span>
    </Link>
  );
  const items = (list: Node[]): React.ReactNode =>
    list.map((n, i) => {
      if (n.type === 'page') return <li key={n.url}>{link(n.url, n.name)}</li>;
      if (n.type === 'folder')
        return (
          <li key={i} className="mt-5 first:mt-0">
            <p className="sec-label mb-2 px-2.5">{n.name}</p>
            <ul>{n.index && <li>{link(n.index.url, n.index.name)}</li>}{items(n.children)}</ul>
          </li>
        );
      return null;
    });
  return (
    <nav aria-label="Lessons">
      <ul>{items(nodes)}</ul>
    </nav>
  );
}
