import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // everything except API routes, Next internals and files in /public
  matcher: ['/((?!api|_next/static|_next/image|favicon.svg|og-default.png|robots.txt|sitemap.xml).*)'],
};
