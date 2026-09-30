// Markdown → HTML at build time. Code is highlighted by Shiki here, so no highlighter ships to the browser.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import type { Element, Root } from 'hast';
import type { RenderedMarkdown } from '@/types';

/** External links open in a new tab; images load lazily. */
function rehypeTweaks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const href = node.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && /^https?:\/\//.test(href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
  .use(rehypeShiki, { theme: 'github-light', defaultLanguage: 'text', fallbackLanguage: 'text' })
  .use(rehypeTweaks)
  .use(rehypeStringify);

export async function renderMarkdown(source: string | null | undefined): Promise<RenderedMarkdown> {
  if (!source?.trim()) return { html: '', toc: [] };

  const tree = (await processor.run(processor.parse(source))) as Root;
  const toc: RenderedMarkdown['toc'] = [];
  visit(tree, 'element', (node: Element) => {
    if ((node.tagName === 'h2' || node.tagName === 'h3') && node.properties?.id) {
      toc.push({ id: String(node.properties.id), text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 });
    }
  });

  return { html: processor.stringify(tree), toc };
}
