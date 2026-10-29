import type { ReactNode } from 'react';

/** Closing card: the few things to remember. Write a short list inside. */
export function Recap({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="recap">
      <div className="sec-label">{title}</div>
      {children}
    </section>
  );
}
