import type { Lang } from './i18n';

export interface FooterCopy {
  blurb: string;
  cta: string;
  start: string;
  plan: string;
  project: string;
  github: string;
  issues: string;
  contributing: string;
  conduct: string;
  security: string;
  license: string;
  author: string;
  about: string;
  portfolio: string;
  rights: (year: number, name: string) => string;
  built: string;
  disclaimer: string;
}

const en: FooterCopy = {
  blurb: 'A free, hands-on AWS course. Predict what AWS will do, run it on LocalStack on your own machine, check the result. No AWS account needed.',
  cta: 'Start with the learning plan',
  start: 'Start here',
  plan: 'Learning plan',
  project: 'Project',
  github: 'Source on GitHub',
  issues: 'Report a bug',
  contributing: 'Contributing',
  conduct: 'Code of conduct',
  security: 'Security policy',
  license: 'MIT license',
  author: 'Author',
  about: 'About the author',
  portfolio: 'Portfolio',
  rights: (year, name) => `© ${year} ${name}. MIT licensed.`,
  built: 'Built with Next.js and Fumadocs. Runs on LocalStack.',
  disclaimer: 'AWS and Amazon Web Services are trademarks of Amazon.com, Inc. This project is not affiliated with Amazon, AWS or LocalStack.',
};

// Bangla copy is a first pass: have a native speaker review it
const bn: FooterCopy = {
  blurb: 'AWS শেখার একটি বিনামূল্যে, হাতে-কলমে কোর্স। AWS কী করবে তা আগে অনুমান করো, নিজের মেশিনে LocalStack-এ চালাও, ফল মেলাও। কোনো AWS অ্যাকাউন্ট লাগে না।',
  cta: 'শেখার পরিকল্পনা দিয়ে শুরু করো',
  start: 'শুরু করো',
  plan: 'শেখার পরিকল্পনা',
  project: 'প্রজেক্ট',
  github: 'GitHub-এ সোর্স',
  issues: 'বাগ জানাও',
  contributing: 'অবদান রাখো',
  conduct: 'আচরণবিধি',
  security: 'নিরাপত্তা নীতি',
  license: 'MIT লাইসেন্স',
  author: 'লেখক',
  about: 'লেখক সম্পর্কে',
  portfolio: 'পোর্টফোলিও',
  rights: (year, name) => `© ${year} ${name}। MIT লাইসেন্সে প্রকাশিত।`,
  built: 'Next.js ও Fumadocs দিয়ে তৈরি। চলে LocalStack-এ।',
  disclaimer: 'AWS ও Amazon Web Services হলো Amazon.com, Inc.-এর ট্রেডমার্ক। এই প্রজেক্টের Amazon, AWS বা LocalStack-এর সঙ্গে কোনো সম্পর্ক নেই।',
};

export const footerCopy: Record<Lang, FooterCopy> = { en, bn };
