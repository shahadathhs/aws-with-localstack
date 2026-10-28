import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { i18n } from './i18n';

const docs = defineDocs({
  dir: 'content/docs',
  docs: { schema: pageSchema },
  meta: { schema: metaSchema },
});

// baseUrl '/' + the language folder gives /en/s3/02-versioning/, the same URLs as the Astro site
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  i18n,
});
