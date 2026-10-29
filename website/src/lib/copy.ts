import type { Lang } from './i18n';

type Status = 'done' | 'next' | 'planned';

export interface Copy {
  label: string;
  title: [string, string, string];
  lead: string;
  start: string;
  setup: string;
  lab: { head: string; predict: string; run: string; verify: string; question: string; guess: string; result: string };
  model: { label: string; title: string; read: string };
  figs: { kicker: string; title: string; text: string; slug: string }[];
  curriculum: { label: string; phase: string; topic: string; lessons: string; status: string; statuses: Record<Status, string> };
  phases: { n: string; title: string; text: string; lessons: number; done: number; status: Status }[];
  short: { label: string; items: { title: string; text: string }[] };
}

const en: Copy = {
  label: 'AWS · on LocalStack · free',
  title: ['Predict it.', 'Run it.', 'Check it.'],
  lead: 'A hands-on AWS course that runs on your laptop. Read the model, write down what AWS will do, run the commands on LocalStack, compare. No account, no bill.',
  start: 'Start with S3',
  setup: 'Set up LocalStack',
  lab: {
    head: 'lab · s3 / versioning',
    predict: 'predict',
    run: 'run',
    verify: 'verify',
    question: 'PUT, PUT, DELETE on one key with versioning on. How many versions? What does GET return?',
    guess: 'my guess: 2 versions, GET returns v2',
    result: 'Close: 2 versions and 1 delete marker. The marker is the newest entry, so reading the key fails with NoSuchKey.',
  },
  model: { label: 'See the model', title: 'Every lesson draws the idea before it types a command.', read: 'Read the lesson →' },
  figs: [
    { kicker: 'S3 · 02', title: 'A delete is a new version', text: 'Versioning turns a key into a stack; DELETE pushes a marker.', slug: 's3/02-versioning' },
    { kicker: 'IAM · 02', title: 'Deny beats allow', text: 'The order policies are evaluated in, and why the default is no.', slug: 'iam/02-policies-and-evaluation' },
    { kicker: 'IAM · 03', title: 'Read any ARN', text: 'Five fields, one address; why S3 leaves two of them empty.', slug: 'iam/03-arns' },
  ],
  curriculum: {
    label: 'Curriculum',
    phase: 'Phase',
    topic: 'Topic',
    lessons: 'Lessons',
    status: 'Status',
    statuses: { done: 'done', next: 'next', planned: 'planned' },
  },
  phases: [
    { n: '0', title: 'Tooling', text: 'Compose, AWS CLI, profiles, how LocalStack routes requests', lessons: 4, done: 4, status: 'done' },
    { n: '1', title: 'S3 and IAM', text: 'Object model, versioning, presigned URLs, policies, ARNs', lessons: 9, done: 9, status: 'done' },
    { n: '2', title: 'Lambda', text: 'Execution model, the event object, S3 and SQS triggers', lessons: 3, done: 0, status: 'next' },
    { n: '3', title: 'API Gateway + DynamoDB', text: 'The serverless chain; design tables around queries', lessons: 3, done: 0, status: 'planned' },
    { n: '4', title: 'SQS, SNS, EventBridge', text: 'Messaging, retries, fan-out, dead-letter queues', lessons: 3, done: 0, status: 'planned' },
  ],
  short: {
    label: 'The short list',
    items: [
      { title: 'Free and local', text: 'LocalStack in Docker. Nothing touches a real AWS account.' },
      { title: 'Concept first', text: 'Guarantees, failure modes and cost drivers, not command memorising.' },
      { title: 'Honest about limits', text: 'Each lesson says what LocalStack skips, like IAM enforcement.' },
      { title: 'English and Bangla', text: 'Every lesson in both languages.' },
      { title: 'Real AWS notes', text: 'What differs on the real service, and what it costs.' },
      { title: 'Open source', text: 'Markdown in the repo; fix a lesson with a pull request.' },
    ],
  },
};

// Bangla copy is a first pass: have a native speaker review it
const bn: Copy = {
  label: 'AWS · LocalStack-এ · বিনামূল্যে',
  title: ['আগে অনুমান করো।', 'চালাও।', 'মিলিয়ে দেখো।'],
  lead: 'তোমার ল্যাপটপেই চলা হাতে-কলমে AWS কোর্স। ধারণা পড়ো, AWS কী করবে তা আগে লিখে রাখো, LocalStack-এ কমান্ড চালাও, তারপর মেলাও। কোনো অ্যাকাউন্ট নেই, কোনো বিল নেই।',
  start: 'S3 দিয়ে শুরু করো',
  setup: 'LocalStack সেট আপ করো',
  lab: {
    head: 'ল্যাব · s3 / versioning',
    predict: 'অনুমান',
    run: 'চালাও',
    verify: 'যাচাই',
    question: 'ভার্সনিং চালু থাকা একটি কী-তে PUT, PUT, DELETE করলে কতগুলো ভার্সন থাকবে? GET কী ফেরত দেবে?',
    guess: 'আমার অনুমান: ২টি ভার্সন, GET v2 ফেরত দেবে',
    result: 'প্রায় ঠিক: ভার্সন ২টি, সঙ্গে ১টি ডিলিট মার্কার। মার্কারটাই সবচেয়ে নতুন এন্ট্রি, তাই key পড়তে গেলে NoSuchKey।',
  },
  model: { label: 'মডেলটা দেখুন', title: 'প্রতিটি লেসন কমান্ড লেখার আগে ধারণাটা এঁকে দেখায়।', read: 'লেসনটি পড়ো →' },
  figs: [
    { kicker: 'S3 · ০২', title: 'ডিলিটও একটি নতুন ভার্সন', text: 'ভার্সনিং একটি কী-কে স্ট্যাকে বদলে দেয়; DELETE একটি মার্কার বসায়।', slug: 's3/02-versioning' },
    { kicker: 'IAM · ০২', title: 'Deny সবসময় Allow-কে হারায়', text: 'পলিসি কোন ক্রমে মূল্যায়ন হয়, আর ডিফল্ট কেন "না"।', slug: 'iam/02-policies-and-evaluation' },
    { kicker: 'IAM · ০৩', title: 'যেকোনো ARN পড়তে শিখুন', text: 'পাঁচটি ঘর, একটি ঠিকানা; S3 কেন দুটি ঘর ফাঁকা রাখে।', slug: 'iam/03-arns' },
  ],
  curriculum: {
    label: 'কারিকুলাম',
    phase: 'ধাপ',
    topic: 'বিষয়',
    lessons: 'লেসন',
    status: 'অবস্থা',
    statuses: { done: 'সম্পন্ন', next: 'পরবর্তী', planned: 'পরিকল্পিত' },
  },
  phases: [
    { n: '০', title: 'টুলিং', text: 'Compose, AWS CLI, প্রোফাইল, LocalStack কীভাবে রিকোয়েস্ট পাঠায়', lessons: 4, done: 4, status: 'done' },
    { n: '১', title: 'S3 ও IAM', text: 'অবজেক্ট মডেল, ভার্সনিং, presigned URL, পলিসি, ARN', lessons: 9, done: 9, status: 'done' },
    { n: '২', title: 'Lambda', text: 'এক্সিকিউশন মডেল, ইভেন্ট অবজেক্ট, S3 ও SQS ট্রিগার', lessons: 3, done: 0, status: 'next' },
    { n: '৩', title: 'API Gateway + DynamoDB', text: 'সার্ভারলেস চেইন; কোয়েরি ধরে টেবিল ডিজাইন', lessons: 3, done: 0, status: 'planned' },
    { n: '৪', title: 'SQS, SNS, EventBridge', text: 'মেসেজিং, রিট্রাই, ফ্যান-আউট, ডেড-লেটার কিউ', lessons: 3, done: 0, status: 'planned' },
  ],
  short: {
    label: 'সংক্ষেপে',
    items: [
      { title: 'বিনামূল্যে, লোকালি', text: 'Docker-এ LocalStack। আসল AWS অ্যাকাউন্টে কিছুই ছোঁয়া হয় না।' },
      { title: 'আগে ধারণা', text: 'গ্যারান্টি, ব্যর্থতার ধরন ও খরচের কারণ — কমান্ড মুখস্থ নয়।' },
      { title: 'সীমাবদ্ধতা নিয়ে সৎ', text: 'প্রতিটি লেসন বলে দেয় LocalStack কী বাদ দেয়, যেমন IAM enforcement।' },
      { title: 'ইংরেজি ও বাংলা', text: 'প্রতিটি লেসন দুই ভাষাতেই।' },
      { title: 'আসল AWS-এর নোট', text: 'আসল সার্ভিসে কী আলাদা, আর তার খরচ কত।' },
      { title: 'ওপেন সোর্স', text: 'রিপোতে Markdown; pull request দিয়ে লেসন ঠিক করো।' },
    ],
  },
};

export const copy: Record<Lang, Copy> = { en, bn };
