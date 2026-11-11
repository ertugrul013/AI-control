import { parseMarkdown, splitBold } from '@/lib/markdown';

const rich = (text: string) =>
  splitBold(text).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));

export function Markdown({ source }: { source: string }) {
  return (
    <div className="grid max-w-[70ch] gap-3">
      {parseMarkdown(source).map((block, i) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2 key={i} className="text-xl">
                {rich(block.text)}
              </h2>
            );
          case 'h2':
            return (
              <h3 key={i} className="mt-2 text-base">
                {rich(block.text)}
              </h3>
            );
          case 'h3':
            return (
              <h4 key={i} className="font-semibold">
                {rich(block.text)}
              </h4>
            );
          case 'p':
            return <p key={i}>{rich(block.text)}</p>;
          case 'ul':
            return (
              <ul key={i} className="grid list-disc gap-1 pl-5">
                {block.items.map((item, n) => (
                  <li key={n}>{rich(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="grid list-decimal gap-1 pl-5">
                {block.items.map((item, n) => (
                  <li key={n}>{rich(item)}</li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
