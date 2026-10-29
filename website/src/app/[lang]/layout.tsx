import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';
import { translations } from '@/lib/translations';
import { SiteFooter } from '@/components/site-footer';
import { isLang } from '@/lib/i18n';
import { i18n } from '@/lib/i18n';
import { appName, siteUrl } from '@/lib/shared';
import '../global.css';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'] });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: 'variable', variable: '--font-sans-latin' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-latin' });
const bnSans = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-sans-bn' });
const bnSerif = Noto_Serif_Bengali({ subsets: ['bengali'], variable: '--font-display-bn' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg' },
  title: { default: appName, template: `%s | ${appName}` },
  description:
    'Learn AWS for free with LocalStack: run S3, IAM, Lambda, API Gateway, DynamoDB, SQS, SNS, EventBridge, CloudWatch, Secrets Manager and Terraform locally in Docker Compose. No AWS account, no cloud bill.',
  openGraph: { type: 'website', siteName: appName, images: [{ url: '/og-default.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
  alternates: { languages: { en: '/en', bn: '/bn' } },
};

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function RootLayout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const fonts = [display, sans, mono, bnSans, bnSerif].map((f) => f.variable).join(' ');
  return (
    <html lang={lang} className={fonts} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider i18n={i18nProvider(translations, lang)}>
          {children}
          {isLang(lang) && <SiteFooter lang={lang} />}
        </RootProvider>
      </body>
    </html>
  );
}
