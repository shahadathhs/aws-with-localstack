import type { ReactNode } from 'react';

export function Section({ n, label, children, first }: { n?: string; label: string; children: ReactNode; first?: boolean }) {
  return (
    <section className="sec" style={first ? { borderTop: 0 } : undefined}>
      <div className="sec-label">
        {n && <b>{n}</b>} {n && '/'} {label}
      </div>
      {children}
    </section>
  );
}
