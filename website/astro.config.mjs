// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// GitHub Pages serves project sites from a subpath (…/aws-with-localstack/),
// Vercel serves from the root. Set DEPLOY_TARGET=github-pages in the Pages
// workflow; Vercel (and local dev) use the defaults.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://shahadathhs.github.io' : 'https://aws-with-localstack.vercel.app',
  base: isGitHubPages ? '/aws-with-localstack' : undefined,
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
        {
          label: 'Guides',
          items: [{ slug: 'guides/localstack-compose' }, { slug: 'guides/install-aws-cli' }],
        },
        {
          label: 'Concepts',
          items: [{ slug: 'concepts/aws-cli' }, { slug: 'concepts/architecture' }],
        },
        { slug: 'learning-plan' },
      ],
    }),
  ],
});
