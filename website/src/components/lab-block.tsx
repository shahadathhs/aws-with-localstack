import type { Copy } from '@/lib/copy';

/** The hero artifact: a predict, run, verify card with real CLI output (the versioning lesson). */
export function LabBlock({ t }: { t: Copy['lab'] }) {
  return (
    <div className="nb">
      <div className="nb-hd">
        <span>{t.head}</span>
        <span>eu-west-1</span>
      </div>
      <div className="nb-row">
        <span className="tag predict">{t.predict}</span>
        <p className="text-sm">{t.question}</p>
        <p className="mt-1.5 font-mono text-xs text-(--accent)">{t.guess}</p>
      </div>
      <div className="nb-row">
        <span className="tag run">{t.run}</span>
        <pre className="term">
          <span className="p">$</span> aws s3api list-object-versions \{'\n'}
          {'    '}--bucket ph1-bucket{'\n'}
          <span className="o">Versions:      2{'\n'}DeleteMarkers: 1{'\n'}</span>
          <span className="p">$</span> aws s3 cp s3://ph1-bucket/note.txt -{'\n'}
          <span className="r">404 NoSuchKey</span>
        </pre>
      </div>
      <div className="nb-row">
        <span className="tag verify">{t.verify}</span>
        <p className="text-sm text-fd-muted-foreground">{t.result}</p>
      </div>
    </div>
  );
}
