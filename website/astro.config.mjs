// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://shahadathhs.github.io',
  base: '/aws-with-localstack',
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
