// @ts-nocheck
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves project sites from a subpath (…/aws-with-localstack/),
// Vercel serves from the root. Set DEPLOY_TARGET=github-pages in the Pages
// workflow; Vercel (and local dev) use the defaults.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';
const base = isGitHubPages ? '/aws-with-localstack' : undefined;

// The canonical production origin. The GitHub Pages deployment is kept as a
// mirror and marked `noindex` (see `head` below) so search engines only rank
// the Vercel site and never split signals across two hosts.
const productionSite = 'https://aws-with-localstack.vercel.app';
const productionUrl = (path = '/') => new URL(path, productionSite).href;

const site = isGitHubPages ? 'https://shahadathhs.github.io' : productionSite;

const author = {
  name: 'Shahadath Hossen Sajib',
  url: 'https://shahadathhs.vercel.app/',
  github: 'https://github.com/shahadathhs',
};

const ogImageUrl = productionUrl('/og-default.png');

// Rewrite root-relative internal links ("/s3/01-object-model/") to include the
// base path. Content links are written root-relative; Starlight only prefixes
// its own chrome (sidebar, pagination), not markdown body links.
function absolutizeInternalLinks() {
  const withBase = (href) => (base ? base + href : href);
  const walk = (node) => {
    if (node.type === 'element' && typeof node.properties?.href === 'string') {
      if (node.properties.href.startsWith('/') && !node.properties.href.startsWith('//')) {
        node.properties.href = withBase(node.properties.href);
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree) => walk(tree);
}

/** @type {import('@astrojs/starlight/types').HeadUserConfig} */
const head = [
  // Social preview fallback for every page that does not set its own ogImage.
  { tag: 'meta', attrs: { property: 'og:image', content: ogImageUrl } },
  { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
  { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
  {
    tag: 'meta',
    attrs: {
      property: 'og:image:alt',
      content: 'AWS with LocalStack — a local AWS sandbox powered by Docker Compose',
    },
  },
  { tag: 'meta', attrs: { name: 'twitter:image', content: ogImageUrl } },
  // Structured data: tells Google what the site is and who wrote it.
  {
    tag: 'script',
    attrs: { type: 'application/ld+json' },
    content: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AWS with LocalStack',
      alternateName: 'Learn AWS for free with LocalStack',
      url: productionUrl('/'),
      inLanguage: ['en', 'bn'],
      description:
        'Learn AWS for free: run S3, SQS, DynamoDB, Lambda and IAM locally with Docker Compose and LocalStack — step-by-step tutorials and a hands-on learning plan.',
      author: { '@type': 'Person', name: author.name, url: author.url },
      publisher: { '@type': 'Person', name: author.name, url: author.url },
    }),
  },
];

// The GitHub Pages deployment is a mirror of the Vercel site — keep it out of
// search indexes to avoid duplicate-content penalties.
if (isGitHubPages) {
  head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } });
}

// https://astro.build/config
export default defineConfig({
  site,
  base,
  markdown: {
    rehypePlugins: [absolutizeInternalLinks],
  },
  integrations: [
    // One sitemap for both deployments — always canonical to the Vercel host.
    // On the Pages build, entry URLs contain the github.io origin and the
    // /aws-with-localstack base; strip both so crawlers only ever see the
    // production URLs (the mirror itself is noindexed via `head` below).
    sitemap({
      // Canonicalize each entry to the Vercel host first (mirrors `serialize`
      // below), then drop the root page — it is only a redirect to /en/.
      filter: (page) => {
        const canonical = isGitHubPages
          ? page.replace('https://shahadathhs.github.io/aws-with-localstack', productionSite)
          : page;
        return canonical.replace(/\/$/, '') !== productionSite;
      },
      serialize(item) {
        const url = isGitHubPages
          ? item.url.replace('https://shahadathhs.github.io/aws-with-localstack', productionSite)
          : item.url;
        return { url, changefreq: 'weekly', priority: 0.7 };
      },
    }),
    starlight({
      title: 'AWS with LocalStack',
      description:
        'Learn AWS for free with LocalStack: run S3, SQS, DynamoDB, Lambda and IAM locally in Docker Compose. Step-by-step AWS tutorials, AWS CLI guides, and a hands-on learning plan — no AWS account, no cloud bill.',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        bn: { label: 'বাংলা', lang: 'bn' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: author.github,
        },
        {
          icon: 'linkedin',
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/shahadathhs/',
        },
        {
          icon: 'x.com',
          label: 'X (Twitter)',
          href: 'https://x.com/shahadathhs',
        },
      ],
      components: {
        Footer: './src/components/Footer.astro',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Home', slug: 'index' },
        { label: 'Learning plan', slug: 'learning-plan' },
        {
          label: 'Getting started',
          items: [
            { slug: 'getting-started/localstack-compose' },
            { slug: 'getting-started/install-aws-cli' },
          ],
        },
        {
          label: 'Basics',
          items: [{ slug: 'basics/aws-cli' }, { slug: 'basics/architecture' }],
        },
        {
          label: 'S3',
          items: [
            { slug: 's3/01-object-model' },
            { slug: 's3/02-versioning' },
            { slug: 's3/03-storage-classes-and-lifecycle' },
            { slug: 's3/04-presigned-urls' },
            { slug: 's3/05-security-and-encryption' },
            { slug: 's3/06-events' },
          ],
        },
        {
          label: 'IAM',
          items: [
            { slug: 'iam/01-principals-users-roles' },
            { slug: 'iam/02-policies-and-evaluation' },
            { slug: 'iam/03-arns' },
          ],
        },
        { label: 'The author', slug: 'author' },
      ],
      head,
    }),
  ],
});
