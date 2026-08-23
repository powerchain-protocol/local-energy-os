import type { ReactNode } from "react";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }

    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const external = href.startsWith("http://") || href.startsWith("https://");
      return (
        <a
          key={index}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {label}
        </a>
      );
    }

    return token;
  });
}

function isSeparator(line: string): boolean {
  return /^:?-{3,}:?$/.test(line.trim());
}

export function MarkdownDocument({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      nodes.push(
        <pre key={`code-${index}`} data-language={language || undefined}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/\*\*/g, "").trim();
      const id = slugify(text);
      if (level === 1) nodes.push(<h1 id={id} key={`h-${index}`}>{inline(text)}</h1>);
      if (level === 2) nodes.push(<h2 id={id} key={`h-${index}`}>{inline(text)}</h2>);
      if (level === 3) nodes.push(<h3 id={id} key={`h-${index}`}>{inline(text)}</h3>);
      if (level === 4) nodes.push(<h4 id={id} key={`h-${index}`}>{inline(text)}</h4>);
      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      nodes.push(
        <blockquote key={`quote-${index}`}>
          {quote.map((part, quoteIndex) => (
            <p key={quoteIndex}>{inline(part)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      nodes.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}
        </ol>,
      );
      continue;
    }

    if (line.trim().startsWith("|") && index + 1 < lines.length) {
      const headerCells = line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
      const separatorCells = lines[index + 1].trim().replace(/^\||\|$/g, "").split("|");
      if (separatorCells.length === headerCells.length && separatorCells.every(isSeparator)) {
        const body: string[][] = [];
        index += 2;
        while (index < lines.length && lines[index].trim().startsWith("|")) {
          body.push(lines[index].trim().slice(1, -1).split("|").map((cell) => cell.trim()));
          index += 1;
        }

        nodes.push(
          <div className="table-wrap" key={`table-${index}`}>
            <table>
              <thead>
                <tr>{headerCells.map((cell, cellIndex) => <th key={cellIndex}>{inline(cell)}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        continue;
      }
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("#") &&
      !lines[index].startsWith("```") &&
      !lines[index].startsWith("> ") &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^---+$/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    nodes.push(<p key={`p-${index}`}>{inline(paragraph.join(" "))}</p>);
  }

  return <article className="markdown-document">{nodes}</article>;
}
