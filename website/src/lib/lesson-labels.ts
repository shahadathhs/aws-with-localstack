import type { Lang } from './i18n';

/** Fixed words used by the lesson components; lesson text itself is authored per language. */
export interface LessonLabels {
  lab: string;
  predict: string;
  run: string;
  verify: string;
  guess: string;
  showAnswer: string;
  realAws: string;
  destructive: string;
  note: string;
  cost: string;
  recap: string;
  learn: string;
  time: string;
  needs: string;
  before: string;
  after: string;
}

const en: LessonLabels = {
  lab: 'lab',
  predict: 'predict',
  run: 'run',
  verify: 'verify',
  guess: 'Your guess…',
  showAnswer: 'Show answer',
  realAws: 'Real AWS',
  destructive: 'Destructive',
  note: 'Good to know',
  cost: 'cost',
  recap: 'Recap',
  learn: 'You will learn',
  time: 'Time',
  needs: 'Needs',
  before: 'before',
  after: 'after',
};

// Bangla labels are a first pass: have a native speaker review them
const bn: LessonLabels = {
  lab: 'ল্যাব',
  predict: 'অনুমান',
  run: 'চালাও',
  verify: 'যাচাই',
  guess: 'তোমার অনুমান…',
  showAnswer: 'উত্তর দেখো',
  realAws: 'রিয়েল AWS',
  destructive: 'ধ্বংসাত্মক',
  note: 'জেনে রাখো',
  cost: 'খরচ',
  recap: 'সারসংক্ষেপ',
  learn: 'যা শিখবে',
  time: 'সময়',
  needs: 'আগে দরকার',
  before: 'আগে',
  after: 'পরে',
};

export const lessonLabels: Record<Lang, LessonLabels> = { en, bn };
