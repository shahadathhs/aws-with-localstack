import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { Logo } from '@/components/logo';
import { i18n, isLang } from './i18n';
import { appName, gitConfig } from './shared';

// Bangla UI strings are a first pass: have a native speaker review them
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: { displayName: 'English' },
    bn: {
      displayName: 'বাংলা',
      'Search(search trigger)': 'খুঁজুন',
      'Search(search dialog)': 'খুঁজুন',
      'No results found(search dialog)': 'কিছু পাওয়া যায়নি',
      'On this page(table of contents)': 'এই পাতায়',
      'Next Page(pagination)': 'পরের পাতা',
      'Previous Page(pagination)': 'আগের পাতা',
      'Choose a language(language switcher)': 'ভাষা বেছে নিন',
      'Edit on GitHub(edit page)': 'GitHub-এ সম্পাদনা করুন',
      'Last updated on(page footer)': 'সর্বশেষ হালনাগাদ',
      'Copy Text(code block)(aria-label)': 'কপি করুন',
    },
  });

export function baseOptions(lang: string): BaseLayoutProps {
  const l = isLang(lang) ? lang : i18n.defaultLanguage;
  return {
    nav: {
      title: (
        <span className="brand">
          <Logo />
          {appName}
        </span>
      ),
      url: `/${l}`,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
