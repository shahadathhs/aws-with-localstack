import type { ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import { lessonLabels } from '@/lib/lesson-labels';
import type { Lang } from '@/lib/i18n';
import { Lab, Predict, Answer, Run, Verify } from './lab';
import { Callout } from './callout';
import { Figures, Figure } from './figure';
import { Recap } from './recap';
import { VersionStack } from '../diagrams/version-stack';
import { IamFlowDiagram } from '../diagrams/iam-flow';
import { ArnDiagram } from '../diagrams/arn';
import { FolderIllusion } from '../diagrams/folder-illusion';
import { StorageLadder } from '../diagrams/storage-ladder';
import { PresignFlow } from '../diagrams/presign-flow';
import { AccessGates } from '../diagrams/access-gates';
import { EventFlow } from '../diagrams/event-flow';
import { AssumeRole } from '../diagrams/assume-role';
import { PolicyStatement } from '../diagrams/policy-statement';
import { Gateway } from '../diagrams/gateway';
import { ResolutionLadder } from '../diagrams/resolution-ladder';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

type C = { children?: ReactNode };
type CalloutProps = C & { title?: string; cost?: boolean };

/** Components available inside lessons (.mdx). Fixed labels come from the lesson's language. */
export function lessonComponents(lang: Lang): MDXComponents {
  const t = lessonLabels[lang];
  const callout = (variant: 'aws' | 'deny' | 'note', kind: string) =>
    function LessonCallout({ title, cost, children }: CalloutProps) {
      return (
        <Callout variant={variant} kind={kind} title={title} cost={cost} costLabel={t.cost}>
          {children}
        </Callout>
      );
    };
  return {
    Lab: (p: { title: string; time?: string; collapsed?: boolean; children?: ReactNode }) => <Lab {...p} label={t.lab} />,
    Predict: (p: C) => <Predict t={t}>{p.children}</Predict>,
    Answer: (p: C) => <Answer t={t}>{p.children}</Answer>,
    Run: (p: C) => <Run t={t}>{p.children}</Run>,
    Verify: (p: C) => <Verify t={t}>{p.children}</Verify>,
    RealAws: callout('aws', t.realAws),
    Destructive: callout('deny', t.destructive),
    Note: callout('note', t.note),
    Recap: (p: C) => <Recap title={t.recap}>{p.children}</Recap>,
    Figures,
    Figure,
    VersionStack,
    IamFlow: IamFlowDiagram,
    Arn: ArnDiagram,
    FolderIllusion,
    StorageLadder,
    PresignFlow,
    AccessGates,
    EventFlow,
    AssumeRole,
    PolicyStatement,
    Gateway,
    ResolutionLadder,
    Tabs,
    Tab,
  };
}
