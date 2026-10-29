import type { ReactNode } from 'react';

/** Two diagrams side by side (stacked on small screens), e.g. before and after. */
export function Figures({ children }: { children: ReactNode }) {
  return <div className="figures">{children}</div>;
}

export function Figure({ tag, caption, children }: { tag?: string; caption?: string; children: ReactNode }) {
  return (
    <figure className="lesson-fig">
      {children}
      {(tag || caption) && (
        <figcaption>
          {tag && <b>{tag}</b>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
