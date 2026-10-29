import type { ReactNode } from 'react';

type Variant = 'aws' | 'deny' | 'note';

/** Amber for real-AWS notes, red for destructive steps, plain for the rest. Colour follows the meaning rules. */
export function Callout({ variant, kind, title, cost, costLabel, children }: { variant: Variant; kind: string; title?: string; cost?: boolean; costLabel: string; children: ReactNode }) {
  return (
    <aside className={`callout ${variant}`}>
      <div className="callout-k">
        {cost && <span className="callout-cost">{costLabel}</span>}
        {title ?? kind}
      </div>
      <div className="callout-b">{children}</div>
    </aside>
  );
}
