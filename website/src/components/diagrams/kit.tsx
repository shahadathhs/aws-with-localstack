import type { ReactNode } from 'react';

/** Small SVG kit for lesson diagrams: every shape takes its colours from the theme tokens (global.css, svg.diagram). */
export type Tone = 'plain' | 'ok' | 'deny' | 'acc' | 'muted';

const BOX: Record<Tone, string> = { plain: 'bx', ok: 'b-ok', deny: 'b-deny', acc: 'b-acc', muted: 'bx muted' };
const TEXT: Record<Tone, string | undefined> = { plain: 't-main', ok: 't-ok', deny: 't-deny', acc: 't-acc', muted: undefined };

export function Svg({ h = 190, label, children }: { h?: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 300 ${h}`} className="diagram" role="img" aria-label={label}>
      <defs>
        <marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="var(--text2)" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

/** A labelled box; `lines` are centred, one per line. */
export function Box({ x, y, w, h, lines, tone = 'plain', dashed }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: Tone; dashed?: boolean }) {
  const first = y + h / 2 - ((lines.length - 1) * 13) / 2 + 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" className={BOX[tone]} strokeDasharray={dashed ? '4 3' : undefined} />
      {lines.map((line, i) => (
        <text key={line} x={x + w / 2} y={first + i * 13} textAnchor="middle" className={TEXT[tone]}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** A straight or bent line given as an SVG path; `arrow` puts a head on the end. */
export function Line({ d, arrow = true, dashed }: { d: string; arrow?: boolean; dashed?: boolean }) {
  return <path d={d} className="ln" markerEnd={arrow ? 'url(#ah)' : undefined} strokeDasharray={dashed ? '3 3' : undefined} />;
}

export function Txt({ x, y, tone, anchor = 'start', children }: { x: number; y: number; tone?: Tone; anchor?: 'start' | 'middle' | 'end'; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={tone ? TEXT[tone] : undefined}>
      {children}
    </text>
  );
}
