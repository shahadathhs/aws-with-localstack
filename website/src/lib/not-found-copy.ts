import type { Lang } from './i18n';

/** Words for the 404 page. Kept apart from the landing copy because this page is a client component. */
export interface NotFoundCopy {
  label: string;
  title: string;
  lead: string;
  plan: string;
  home: string;
  head: string;
  run: string;
  verify: string;
  result: string;
}

const en: NotFoundCopy = {
  label: 'Error 404',
  title: 'That page is not here.',
  lead: 'The key you asked for does not exist: it was never created, or it moved. Try the learning plan, or search the lessons with Ctrl or ⌘ K.',
  plan: 'Open the learning plan',
  home: 'Home',
  head: 'lab · s3 / get-object',
  run: 'run',
  verify: 'verify',
  result: 'NoSuchKey: nothing is stored under that key. Check the address for a typo.',
};

// Bangla copy is a first pass: have a native speaker review it
const bn: NotFoundCopy = {
  label: 'ত্রুটি ৪০৪',
  title: 'এই পাতাটি এখানে নেই।',
  lead: 'তুমি যে key খুঁজছ সেটি নেই: হয় কখনো তৈরি হয়নি, নয়তো সরে গেছে। শেখার পরিকল্পনা দেখো, অথবা Ctrl বা ⌘ K দিয়ে লেসন খুঁজে নাও।',
  plan: 'শেখার পরিকল্পনা খোলো',
  home: 'হোম',
  head: 'ল্যাব · s3 / get-object',
  run: 'চালাও',
  verify: 'যাচাই',
  result: 'NoSuchKey: ওই key-র নিচে কিছু জমা নেই। ঠিকানায় বানান ভুল আছে কি না দেখো।',
};

export const notFoundCopy: Record<Lang, NotFoundCopy> = { en, bn };
