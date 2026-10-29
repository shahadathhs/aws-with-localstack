import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { i18n } from './i18n';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // optional lesson header fields: reading time, prerequisites, and the "you will learn" list
    schema: pageSchema.extend({
      time: z.string().optional(),
      needs: z.array(z.string()).optional(),
      learn: z.array(z.string()).optional(),
    }),
  },
  meta: { schema: metaSchema },
});

// baseUrl '/' + the language folder gives /en/s3/02-versioning/, the same URLs as the Astro site
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  i18n,
});
