import type { TableOfContents } from 'fumadocs-core/toc';

/** "On this page": the h2/h3 headings of the lesson, as plain anchor links. */
export function DocsToc({ toc, title }: { toc: TableOfContents; title: string }) {
  if (toc.length === 0) return null;
  return (
    <nav aria-label={title}>
      <p className="sec-label">{title}</p>
      <ul className="space-y-1.5 text-[13px]">
        {toc.map((h) => (
          <li key={h.url} style={{ paddingInlineStart: (h.depth - 2) * 12 }}>
            <a href={h.url} className="text-fd-muted-foreground hover:text-fd-foreground">
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
