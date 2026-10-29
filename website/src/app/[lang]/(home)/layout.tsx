import { HomeHeader } from '@/components/home-header';
import { isLang, i18n } from '@/lib/i18n';

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <>
      <HomeHeader lang={isLang(lang) ? lang : i18n.defaultLanguage} />
      <div className="flex-1 pt-14">{children}</div>
    </>
  );
}
