import Link from 'next/link';
import type { Copy } from '@/lib/copy';
import type { Lang } from '@/lib/i18n';
import { gitConfig } from '@/lib/shared';

export function SiteFooter({ lang, t }: { lang: Lang; t: Copy['footer'] }) {
  const other = lang === 'en' ? 'bn' : 'en';
  return (
    <footer className="foot">
      <div>
        <b>{t.learn}</b>
        <Link href={`/${lang}/learning-plan`}>{t.plan}</Link>
        <Link href={`/${lang}/s3/01-object-model`}>S3</Link>
        <Link href={`/${lang}/iam/01-principals-users-roles`}>IAM</Link>
      </div>
      <div>
        <b>{t.setup}</b>
        <Link href={`/${lang}/getting-started/localstack-compose`}>{t.compose}</Link>
        <Link href={`/${lang}/getting-started/install-aws-cli`}>{t.cli}</Link>
        <Link href={`/${lang}/basics/architecture`}>{t.arch}</Link>
      </div>
      <div>
        <b>{t.project}</b>
        <a href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}>GitHub</a>
        <Link href={`/${lang}/author`}>{t.author}</Link>
        <Link href={`/${other}`}>{other === 'bn' ? 'বাংলা' : 'English'}</Link>
      </div>
    </footer>
  );
}
