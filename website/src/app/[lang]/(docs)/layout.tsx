import { HomeHeader } from '@/components/home-header';
import { isLang, i18n } from '@/lib/i18n';

// The same header and ruled 1080px column as the home page; the lesson pages fill the column.
export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const l = isLang(lang) ? lang : i18n.defaultLanguage;
  return (
    <>
      <HomeHeader lang={l} />
      <div className="col flex-1 pt-14 w-full">{children}</div>
    </>
  );
}
