'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { notFoundCopy } from '@/lib/not-found-copy';
import { i18n, isLang } from '@/lib/i18n';

/** The 404: a missing page is an S3 NoSuchKey, drawn as the same lab card the home page uses. */
export default function NotFound() {
  const { lang } = useParams<{ lang: string }>();
  const l = isLang(lang) ? lang : i18n.defaultLanguage;
  const t = notFoundCopy[l];
  const key = usePathname().replace(/^\/|\/$/g, '') || l;

  return (
    <section className="sec grid items-start gap-10 md:grid-cols-[1fr_420px]" style={{ borderTop: 0, paddingTop: 56, paddingBottom: 56 }}>
      <title>{t.title}</title>
      <div>
        <div className="sec-label">{t.label}</div>
        <h1 className="text-[40px] leading-[1.08] md:text-[52px]">{t.title}</h1>
        <p className="mt-5 max-w-[520px] text-[17px] text-fd-muted-foreground md:text-lg">{t.lead}</p>
        <div className="mt-7 grid gap-2.5 sm:flex sm:gap-3">
          <Link href={`/${l}/learning-plan`} className="btn primary">
            {t.plan} <ArrowRight className="size-4" />
          </Link>
          <Link href={`/${l}`} className="btn">
            {t.home}
          </Link>
        </div>
      </div>
      <div className="nb">
        <div className="nb-hd">
          <span>{t.head}</span>
          <span>404</span>
        </div>
        <div className="nb-row">
          <span className="tag run">{t.run}</span>
          <pre className="term">
            <span className="p">$</span> aws s3api get-object \{'\n'}
            {'    '}--bucket aws-with-localstack \{'\n'}
            {'    '}--key {key} out.html{'\n'}
            <span className="r">NoSuchKey</span>
          </pre>
        </div>
        <div className="nb-row">
          <span className="tag verify">{t.verify}</span>
          <p className="text-sm text-fd-muted-foreground">{t.result}</p>
        </div>
      </div>
    </section>
  );
}
