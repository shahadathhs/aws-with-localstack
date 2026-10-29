import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { lessonComponents } from './lesson';
import { i18n, type Lang } from '@/lib/i18n';

export function getMDXComponents(components?: MDXComponents, lang: Lang = i18n.defaultLanguage) {
  return {
    ...defaultMdxComponents,
    ...lessonComponents(lang),
    ...components,
  } satisfies MDXComponents;
}
