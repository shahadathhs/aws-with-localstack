import type { Node } from 'fumadocs-core/page-tree';

export type PageLink = { url: string; name: React.ReactNode };
export type FolderNode = Extract<Node, { type: 'folder' }>;

/** Every page under these nodes, in sidebar order (a folder's index page first). */
export function flatPages(nodes: Node[]): PageLink[] {
  return nodes.flatMap((n) => {
    if (n.type === 'page') return [n];
    if (n.type === 'folder') return [...(n.index ? [n.index] : []), ...flatPages(n.children)];
    return [];
  });
}
