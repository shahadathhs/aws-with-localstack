import type { ReactNode } from 'react';
import type { LessonLabels } from '@/lib/lesson-labels';

/** A lab: numbered Predict, Run and Verify steps in one card. Steps number themselves with a CSS counter. */
export function Lab({ title, time, collapsed, label, children }: { title: string; time?: string; collapsed?: boolean; label: string; children?: ReactNode }) {
  const head = (
    <>
      <span>
        {label} · {title}
      </span>
      {time && <span>{time}</span>}
    </>
  );
  if (collapsed) {
    return (
      <details className="lab">
        <summary className="lab-hd">{head}</summary>
        <div>{children}</div>
      </details>
    );
  }
  return (
    <div className="lab">
      <div className="lab-hd">{head}</div>
      {children}
    </div>
  );
}

type StepKind = 'predict' | 'run' | 'verify';

function Step({ kind, tag, children }: { kind: StepKind; tag: string; children: ReactNode }) {
  return (
    <div className={`lab-step ${kind}`}>
      <div className="lab-n" aria-hidden />
      <div className="lab-body">
        <span className="tag">{tag}</span>
        {children}
      </div>
    </div>
  );
}

export function Predict({ t, children }: { t: LessonLabels; children: ReactNode }) {
  return (
    <Step kind="predict" tag={t.predict}>
      {children}
      <textarea className="lab-guess" rows={2} placeholder={t.guess} aria-label={t.guess} />
    </Step>
  );
}

/** The answer stays hidden until the reader opens it, so they commit to a guess first. */
export function Answer({ t, children }: { t: LessonLabels; children: ReactNode }) {
  return (
    <details className="lab-answer">
      <summary>{t.showAnswer}</summary>
      <div>{children}</div>
    </details>
  );
}

export function Run({ t, children }: { t: LessonLabels; children: ReactNode }) {
  return (
    <Step kind="run" tag={t.run}>
      {children}
    </Step>
  );
}

export function Verify({ t, children }: { t: LessonLabels; children: ReactNode }) {
  return (
    <Step kind="verify" tag={t.verify}>
      {children}
    </Step>
  );
}
