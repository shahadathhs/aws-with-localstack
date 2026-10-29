import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Orama has no Bengali tokenizer; English tokenization still matches the Latin terms (S3, IAM, ARN, CLI) in Bangla pages
export const { GET } = createFromSource(source, {
  localeMap: { en: { language: 'english' }, bn: { language: 'english' } },
});
