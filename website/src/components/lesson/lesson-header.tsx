import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { TableOfContents } from 'fumadocs-core/toc';
import type { LessonLabels } from '@/lib/lesson-labels';

interface Props {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  time?: string;
  needs?: string[];
  learn?: string[];
  toc: TableOfContents;
  t: LessonLabels;
}

/** Title, lead, meta strip, "you will learn" list and numbered anchor chips (built from the lesson's h2 headings). */
export function LessonHeader({ eyebrow, title, description, time, needs, learn, toc, t }: Props) {
  const sections = toc.filter((h) => h.depth === 2);
  return (
    <header>
      {eyebrow}
      <h1 className="lesson-title">{title}</h1>
      {description && <p className="lesson-lead">{description}</p>}
      {(time || needs?.length) && (
        <div className="lesson-meta">
          {time && (
            <span>
              <b>{t.time}</b>
              {time}
            </span>
          )}
          {needs && needs.length > 0 && (
            <span>
              <b>{t.needs}</b>
              {needs.join(', ')}
            </span>
          )}
        </div>
      )}
      {learn && learn.length > 0 && (
        <div className="lesson-learn">
          <div className="sec-label">{t.learn}</div>
          <ul>
            {learn.map((item) => (
              <li key={item}>
                <Check className="size-4" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {sections.length > 1 && (
        <nav className="lesson-chips" aria-label="On this page">
          {sections.map((h, i) => (
            <a key={h.url} href={h.url}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              {h.title}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
