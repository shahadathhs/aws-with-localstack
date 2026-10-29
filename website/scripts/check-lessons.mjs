// Checks that every English lesson has a Bangla twin built the same way: same files, same lab/callout/diagram
// components in the same order, same number of sections, code blocks and tables. Text is not compared.
// Run with `pnpm check:content`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../content/docs/', import.meta.url).pathname;
const read = (lang, file) => readFileSync(join(root, lang, file), 'utf8');

function files(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full, base) : [relative(base, full)];
  });
}

/** What a lesson is made of: component tags in order, h2 count, code fences, tables, which header fields it sets. */
function shape(source) {
  const body = source.replace(/^---[\s\S]*?---/, '');
  const noCode = body.replace(/```[\s\S]*?```/g, '');
  return {
    components: [...noCode.matchAll(/<([A-Z][A-Za-z]*)/g)].map((m) => m[1]).join(' '),
    sections: (noCode.match(/^## /gm) ?? []).length,
    fences: (body.match(/^```/gm) ?? []).length / 2,
    tables: (noCode.match(/^\|[\s:|-]+\|\s*$/gm) ?? []).length,
    header: ['time', 'needs', 'learn'].filter((k) => new RegExp(`^${k}:`, 'm').test(source)).join(),
  };
}

const strip = (f) => f.replace(/\.mdx?$/, '');
const lessons = (lang) => files(join(root, lang)).filter((f) => !f.endsWith('meta.json'));
const en = lessons('en');
const bn = lessons('bn');
const problems = [];

/** Mistakes the MDX compiler rejects, caught here so a lesson can be checked without a full site build. */
function mdxProblems(lang, file) {
  const source = read(lang, file);
  const found = [];
  const front = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  for (const line of front.split('\n')) {
    const item = line.match(/^\s+- (.*)$/)?.[1];
    if (item && item.includes(': ') && !/^["']/.test(item)) found.push(`${lang}/${file}: quote this header item (it contains ": "): ${item}`);
  }
  const prose = source.replace(/^---[\s\S]*?---/, '').replace(/```[\s\S]*?```/g, '');
  if (/<https?:\/\//.test(prose)) found.push(`${lang}/${file}: <https://...> autolinks are not valid MDX; write [text](url)`);
  return found;
}

for (const f of en.filter((f) => f.endsWith('.mdx'))) problems.push(...mdxProblems('en', f));
for (const g of bn.filter((g) => g.endsWith('.mdx'))) problems.push(...mdxProblems('bn', g));

for (const f of en) {
  const twin = bn.find((g) => strip(g) === strip(f));
  if (!twin) {
    problems.push(`${f}: missing in bn/`);
    continue;
  }
  const a = shape(read('en', f));
  const b = shape(read('bn', twin));
  for (const key of Object.keys(a)) if (a[key] !== b[key]) problems.push(`${strip(f)}: ${key} differs (en: ${a[key] || 'none'} | bn: ${b[key] || 'none'})`);
}
for (const g of bn) if (!en.some((f) => strip(f) === strip(g))) problems.push(`${g}: missing in en/`);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`ok: ${en.length} lessons match in en and bn`);
