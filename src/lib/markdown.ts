export type Block = { type: 'h1' | 'h2' | 'h3' | 'p'; text: string } | { type: 'ul' | 'ol'; items: string[] };

// shortcut: supports headings, lists, paragraphs and **bold** only (what the policy and training
// templates use); switch to a full Markdown library if editors need tables, links or code.
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const item = /^(?:[-*]|(\d+)\.)\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: `h${heading[1].length}` as 'h1' | 'h2' | 'h3', text: heading[2] });
    } else if (item) {
      flush();
      const type = item[1] ? 'ol' : 'ul';
      const last = blocks.at(-1);
      if (last?.type === type) last.items.push(item[2]);
      else blocks.push({ type, items: [item[2]] });
    } else if (line === '') flush();
    else paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Splits text on **bold** markers: odd indexes are the bold parts. */
export const splitBold = (text: string) => text.split(/\*\*(.+?)\*\*/g);
