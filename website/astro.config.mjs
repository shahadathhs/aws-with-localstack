// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// GitHub Pages serves project sites from a subpath (…/aws-with-localstack/),
// Vercel serves from the root. Set DEPLOY_TARGET=github-pages in the Pages
// workflow; Vercel (and local dev) use the defaults.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';
const base = isGitHubPages ? '/aws-with-localstack' : undefined;

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

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://shahadathhs.github.io' : 'https://aws-with-localstack.vercel.app',
  base,
  markdown: {
    rehypePlugins: [absolutizeInternalLinks],
  },
  integrations: [
    starlight({
      title: 'AWS with LocalStack',
      description:
        'Learn AWS for free: a local sandbox with Docker Compose, guided docs, and a hands-on curriculum.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/shahadathhs/aws-with-localstack',
        },
      ],
      sidebar: [
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
      ],
    }),
  ],
});
