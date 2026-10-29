import { uiTranslations } from 'fumadocs-ui/i18n';
import { i18n } from './i18n';

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
