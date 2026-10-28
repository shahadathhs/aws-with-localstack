import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { copy } from '@/lib/copy';
import { isLang } from '@/lib/i18n';
import { LabBlock } from '@/components/lab-block';
import { Section } from '@/components/section';
import { FigureCards } from '@/components/figure-cards';
import { Curriculum } from '@/components/curriculum';
import { SiteFooter } from '@/components/site-footer';

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = copy[lang];

  return (
    <main className="col">
      <section className="sec grid items-start gap-10 md:grid-cols-[1fr_420px]" style={{ borderTop: 0, paddingTop: 56 }}>
        <div>
          <div className="sec-label">{t.label}</div>
          <h1 className="text-[44px] leading-[1.05] md:text-[56px]">
            {t.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-[520px] text-[17px] text-fd-muted-foreground md:text-lg">{t.lead}</p>
          <div className="mt-7 grid gap-2.5 sm:flex sm:gap-3">
            <Link href={`/${lang}/s3/01-object-model`} className="btn primary">
              {t.start} <ArrowRight className="size-4" />
            </Link>
            <Link href={`/${lang}/getting-started/localstack-compose`} className="btn">
              {t.setup}
            </Link>
          </div>
          <p className="mt-4 font-mono text-[13px] text-(--text3)">make up &nbsp;→&nbsp; http://localhost:4566</p>
        </div>
        <LabBlock t={t.lab} />
      </section>
      <Section n="01" label={t.model.label}>
        <h2 className="mb-5 text-2xl md:text-3xl">{t.model.title}</h2>
        <FigureCards lang={lang} t={t} />
      </Section>
      <Section n="02" label={t.curriculum.label}>
        <Curriculum t={{ ...t.curriculum, phases: t.phases }} />
      </Section>
      <Section n="03" label={t.short.label}>
        <div className="short">
          {t.short.items.map((i) => (
            <div key={i.title}>
              <b>{i.title}</b>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <SiteFooter lang={lang} t={t.footer} />
    </main>
  );
}
