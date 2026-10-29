import Link from 'next/link';
import type { Copy } from '@/lib/copy';
import type { Lang } from '@/lib/i18n';
import { VersionsDiagram } from './diagrams/versions';
import { IamFlowDiagram } from './diagrams/iam-flow';
import { ArnDiagram } from './diagrams/arn';

const DIAGRAMS = [VersionsDiagram, IamFlowDiagram, ArnDiagram];

/** Three drawn explanations, each linking to the lesson it comes from. */
export function FigureCards({ lang, t }: { lang: Lang; t: Copy }) {
  return (
    <div className="figs">
      {t.figs.map((f, i) => {
        const Diagram = DIAGRAMS[i];
        return (
          <Link key={f.slug} href={`/${lang}/${f.slug}`} className="fig">
            <Diagram />
            <div className="meta">
              <div className="kick">{f.kicker}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p>{f.text}</p>
              <span className="more">{t.model.read}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
